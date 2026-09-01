const db = require('../config/db');

// GET /api/university/recommended  (UNIVERSITY)
// Shows challenges matched to this user's university, ranked by score.
// Includes all matched challenges (pending validation, validated, etc.) so universities can see suggestions immediately.
async function recommendedChallenges(req, res) {
  try {
    const uniResult = await db.query('SELECT id FROM universities WHERE organization_id = $1', [req.user.organizationId]);
    const university = uniResult.rows[0];
    if (!university) return res.json({ challenges: [] });

    const result = await db.query(
      `SELECT DISTINCT ON (c.id) c.*, cm.match_score, cm.reasons, a.priority, a.severity_score, a.impact_score,
       fi.status as faculty_status, fi.user_id as faculty_id
       FROM challenge_matches cm
       JOIN challenges c ON c.id = cm.challenge_id
       LEFT JOIN challenge_ai_analysis a ON a.challenge_id = c.id
       LEFT JOIN faculty_interest fi ON fi.challenge_id = c.id AND fi.user_id = $2
       WHERE cm.university_id = $1
         AND c.status IN ('VALIDATED', 'HEI_MATCHED')
         AND c.status NOT IN ('ADOPTED', 'IN_PROGRESS', 'DEPLOYED', 'CLOSED')
         AND (fi.status IS NULL OR fi.status = 'REJECTED')
         AND NOT EXISTS (
           SELECT 1 FROM faculty_interest fi2 
           WHERE fi2.challenge_id = c.id AND fi2.status = 'ACCEPTED'
         )
       ORDER BY c.id, cm.match_score DESC, c.created_at DESC`,
      [university.id, req.user.id]
    );
    res.json({ challenges: result.rows });
  } catch (err) {
    console.error('[university] recommended error:', err);
    res.status(500).json({ error: 'Failed to fetch recommended challenges' });
  }
}

// POST /api/university/challenges/:id/adopt  (UNIVERSITY)
async function adoptChallenge(req, res) {
  const { id } = req.params;
  try {
    const uniResult = await db.query('SELECT id FROM universities WHERE organization_id = $1', [req.user.organizationId]);
    const university = uniResult.rows[0];
    if (!university) return res.status(400).json({ error: 'No university profile linked to this account' });

    await db.query(`UPDATE challenges SET status = 'ADOPTED', updated_at = NOW() WHERE id = $1`, [id]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
       VALUES ($1,'ADOPT_CHALLENGE','challenge',$2)`,
      [req.user.id, id]
    );

    res.json({ message: 'Challenge adopted', challengeId: id, universityId: university.id });
  } catch (err) {
    console.error('[university] adopt error:', err);
    res.status(500).json({ error: 'Failed to adopt challenge' });
  }
}

// POST /api/university/projects  (UNIVERSITY) - create project from an adopted challenge
async function createProject(req, res) {
  const { challengeId, title, facultyMentor, objectives, teamMembers } = req.body;

  if (!challengeId || !title) {
    return res.status(400).json({ error: 'challengeId and title are required' });
  }

  try {
    const uniResult = await db.query('SELECT id FROM universities WHERE organization_id = $1', [req.user.organizationId]);
    const university = uniResult.rows[0];

    const projectResult = await db.query(
      `INSERT INTO projects (challenge_id, university_id, title, faculty_mentor, objectives, status)
       VALUES ($1,$2,$3,$4,$5,'TEAM_FORMATION') RETURNING *`,
      [challengeId, university.id, title, facultyMentor || null, objectives || null]
    );
    const project = projectResult.rows[0];

    if (Array.isArray(teamMembers)) {
      for (const member of teamMembers) {
        await db.query(
          `INSERT INTO project_members (project_id, name, role, email) VALUES ($1,$2,$3,$4)`,
          [project.id, member.name, member.role, member.email || null]
        );
      }
    }

    await db.query(`UPDATE challenges SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = $1`, [challengeId]);

    res.status(201).json({ project });
  } catch (err) {
    console.error('[university] createProject error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

// GET /api/university/dashboard  (UNIVERSITY) - summary counts
async function dashboard(req, res) {
  try {
    const uniResult = await db.query('SELECT * FROM universities WHERE organization_id = $1', [req.user.organizationId]);
    const university = uniResult.rows[0];
    if (!university) return res.json({ university: null });

    const projectsResult = await db.query('SELECT * FROM projects WHERE university_id = $1 ORDER BY created_at DESC', [university.id]);

    res.json({
      university,
      activeProjects: projectsResult.rows,
    });
  } catch (err) {
    console.error('[university] dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

// POST /api/university/challenges/:id/interest  (UNIVERSITY) - faculty accept/reject challenge
async function facultyInterest(req, res) {
  const { id } = req.params;
  const { action } = req.body; // 'ACCEPT' or 'REJECT'

  if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'action must be ACCEPT or REJECT' });
  }

  try {
    const uniResult = await db.query('SELECT id FROM universities WHERE organization_id = $1', [req.user.organizationId]);
    const university = uniResult.rows[0];
    if (!university) return res.status(400).json({ error: 'No university profile linked to this account' });

    // Check if challenge exists and is available
    const challengeResult = await db.query('SELECT * FROM challenges WHERE id = $1', [id]);
    const challenge = challengeResult.rows[0];
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // Check if already accepted by another faculty
    const acceptedResult = await db.query(
      `SELECT * FROM faculty_interest WHERE challenge_id = $1 AND status = 'ACCEPTED'`,
      [id]
    );
    if (acceptedResult.rows.length > 0) {
      return res.status(400).json({ error: 'This challenge has already been accepted by another faculty' });
    }

    // Upsert faculty interest
    await db.query(
      `INSERT INTO faculty_interest (challenge_id, user_id, university_id, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (challenge_id, user_id) 
       DO UPDATE SET status = $4, updated_at = NOW()`,
      [id, req.user.id, university.id, action]
    );

    res.json({ message: `Challenge ${action.toLowerCase()}ed successfully` });
  } catch (err) {
    console.error('[university] facultyInterest error:', err);
    res.status(500).json({ error: 'Failed to process faculty interest' });
  }
}

module.exports = { recommendedChallenges, adoptChallenge, createProject, dashboard, facultyInterest };
