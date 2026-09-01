const db = require('../config/db');
const aiService = require('../services/aiService');
const { generateChallengeCode } = require('../utils/idGenerator');

// POST /api/challenges  (CITIZEN)
// Creates a challenge, immediately runs it through the AI analysis service,
// and leaves it in PENDING_VALIDATION for government review.
async function submitChallenge(req, res) {
  const {
    title, description, domain, peopleAffected,
    district, block, village, existingInterventions, imageUrl,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  try {
    const stateCode = (district || 'XX').slice(0, 2).toUpperCase();
    const challengeCode = await generateChallengeCode(db, stateCode);

    // Handle file upload
    let finalImageUrl = imageUrl || null;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const insertResult = await db.query(
      `INSERT INTO challenges
        (challenge_code, title, description, domain, people_affected, district, block, village,
         existing_interventions, image_url, submitted_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'AI_ANALYSIS')
       RETURNING *`,
      [challengeCode, title, description, domain, peopleAffected || null,
       district, block, village, existingInterventions || null, finalImageUrl, req.user.id]
    );
    const challenge = insertResult.rows[0];

    // Run AI analysis (mocked-but-realistic; falls back gracefully if the
    // FastAPI service is offline).
    const analysis = await aiService.analyzeChallenge({
      title, description, domain, district, block, village,
    });

    await db.query(
      `INSERT INTO challenge_ai_analysis
        (challenge_id, domain, priority, severity_score, impact_score, required_skills)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [challenge.id, analysis.domain, analysis.priority, analysis.severity_score,
       analysis.impact_score, JSON.stringify(analysis.required_skills || [])]
    );

    await db.query(
      `UPDATE challenges SET status = 'PENDING_VALIDATION', updated_at = NOW() WHERE id = $1`,
      [challenge.id]
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1,'SUBMIT_CHALLENGE','challenge',$2,$3)`,
      [req.user.id, challenge.id, JSON.stringify({ challengeCode, matchesCount: 0 })]
    );

    res.status(201).json({
      challenge: { ...challenge, status: 'PENDING_VALIDATION' },
      aiAnalysis: analysis,
      matches: [],
    });
  } catch (err) {
    console.error('[challenges] submit error:', err);
    res.status(500).json({ error: 'Failed to submit challenge' });
  }
}

// GET /api/challenges  (all roles; citizens see only their own unless GOVERNMENT)
async function listChallenges(req, res) {
  try {
    let query = `SELECT c.*, a.priority, a.severity_score, a.impact_score, a.required_skills
                 FROM challenges c
                 LEFT JOIN challenge_ai_analysis a ON a.challenge_id = c.id`;
    const params = [];

    if (req.user.role === 'CITIZEN') {
      query += ' WHERE c.submitted_by = $1';
      params.push(req.user.id);
    } else if (req.query.status) {
      query += ' WHERE c.status = $1';
      params.push(req.query.status);
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await db.query(query, params);
    res.json({ challenges: result.rows });
  } catch (err) {
    console.error('[challenges] list error:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
}

// GET /api/challenges/:id  (full detail incl. AI analysis, matches, similar)
async function getChallenge(req, res) {
  const { id } = req.params;
  try {
    const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [id]);
    const challenge = challengeResult.rows[0];
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const analysisResult = await db.query('SELECT * FROM challenge_ai_analysis WHERE challenge_id = $1', [id]);
    const matchesResult = await db.query(
      `SELECT cm.*, u.name AS university_name, u.location AS university_location
       FROM challenge_matches cm JOIN universities u ON u.id = cm.university_id
       WHERE cm.challenge_id = $1 ORDER BY cm.match_score DESC`,
      [id]
    );

    res.json({
      challenge,
      aiAnalysis: analysisResult.rows[0] || null,
      matches: matchesResult.rows,
    });
  } catch (err) {
    console.error('[challenges] get error:', err);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
}

// POST /api/challenges/:id/review  (GOVERNMENT) - approve / reject / request-info
async function reviewChallenge(req, res) {
  const { id } = req.params;
  const { action, comment } = req.body; // action: APPROVE | REJECT | REQUEST_INFO

  const statusMap = {
    APPROVE: 'VALIDATED',
    REJECT: 'REJECTED',
    REQUEST_INFO: 'INFO_REQUESTED',
  };
  const newStatus = statusMap[action];
  if (!newStatus) {
    return res.status(400).json({ error: 'action must be APPROVE, REJECT, or REQUEST_INFO' });
  }

  try {
    const result = await db.query(
      `UPDATE challenges SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );
    const challenge = result.rows[0];
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1,$2,'challenge',$3,$4)`,
      [req.user.id, `REVIEW_${action}`, id, JSON.stringify({ comment: comment || null })]
    );

    let matches = [];
    let updatedChallenge = challenge;
    if (action === 'APPROVE') {
      const matchResult = await aiService.matchHEIs({
        title: challenge.title,
        domain: challenge.domain,
        description: challenge.description,
      });
      matches = matchResult.matches || [];

      for (const m of matches) {
        await db.query(
          `INSERT INTO challenge_matches (challenge_id, university_id, match_score, reasons)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (challenge_id, university_id) DO UPDATE SET
             match_score = EXCLUDED.match_score,
             reasons = EXCLUDED.reasons,
             ranked_at = NOW()`,
          [id, m.university_id, m.match_score, JSON.stringify(m.reasons || [])]
        );
      }

      const finalResult = await db.query(
        `UPDATE challenges SET status = 'HEI_MATCHED', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      updatedChallenge = finalResult.rows[0];
    }

    res.json({ challenge: updatedChallenge, matches });
  } catch (err) {
    console.error('[challenges] review error:', err);
    res.status(500).json({ error: 'Failed to review challenge' });
  }
}

// POST /api/challenges/:id/messages  (CITIZEN, GOVERNMENT)
async function sendMessage(req, res) {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // Handle file upload
    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `INSERT INTO challenge_messages (challenge_id, sender_id, message, attachment_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, req.user.id, message, attachmentUrl]
    );

    // Update challenge status if it was INFO_REQUESTED and citizen is responding
    if (req.user.role === 'CITIZEN') {
      const challengeResult = await db.query('SELECT status FROM challenges WHERE id = $1', [id]);
      const challenge = challengeResult.rows[0];
      if (challenge && challenge.status === 'INFO_REQUESTED') {
        await db.query(
          `UPDATE challenges SET status = 'PENDING_VALIDATION', updated_at = NOW() WHERE id = $1`,
          [id]
        );
      }
    }

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('[challenges] sendMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

// GET /api/challenges/:id/messages  (CITIZEN, GOVERNMENT)
async function getMessages(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT cm.*, u.name as sender_name, u.role as sender_role
       FROM challenge_messages cm
       JOIN users u ON u.id = cm.sender_id
       WHERE cm.challenge_id = $1
       ORDER BY cm.created_at ASC`,
      [id]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('[challenges] getMessages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

module.exports = { submitChallenge, listChallenges, getChallenge, reviewChallenge, sendMessage, getMessages };
