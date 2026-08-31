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
      `SELECT c.*, cm.match_score, cm.reasons, a.priority, a.severity_score, a.impact_score
       FROM challenge_matches cm
       JOIN challenges c ON c.id = cm.challenge_id
       LEFT JOIN challenge_ai_analysis a ON a.challenge_id = c.id
       WHERE cm.university_id = $1
         AND c.status IN ('VALIDATED', 'HEI_MATCHED')
         AND c.status NOT IN ('ADOPTED', 'IN_PROGRESS', 'DEPLOYED', 'CLOSED')
       ORDER BY cm.match_score DESC, c.created_at DESC`,
      [university.id]
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

module.exports = { recommendedChallenges, adoptChallenge, createProject, dashboard };
