const db = require('../config/db');

const LIFECYCLE_STAGES = [
  'Submitted', 'AI Analysis', 'Government Validated', 'HEI Matched', 'Adopted',
  'Team Formed', 'Industry Partner', 'Prototype', 'Testing', 'Pilot',
  'Deployment', 'Impact Measurement',
];

// GET /api/projects/:id
async function getProject(req, res) {
  const { id } = req.params;
  try {
    const projectResult = await db.query(
      `SELECT p.*, c.title AS challenge_title, c.challenge_code, u.name AS university_name
       FROM projects p
       JOIN challenges c ON c.id = p.challenge_id
       JOIN universities u ON u.id = p.university_id
       WHERE p.id = $1`,
      [id]
    );
    const project = projectResult.rows[0];
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const membersResult = await db.query('SELECT * FROM project_members WHERE project_id = $1', [id]);
    const milestonesResult = await db.query('SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC', [id]);
    const impactResult = await db.query('SELECT * FROM impact_metrics WHERE project_id = $1 ORDER BY recorded_at DESC LIMIT 1', [id]);

    res.json({
      project,
      members: membersResult.rows,
      milestones: milestonesResult.rows,
      impact: impactResult.rows[0] || null,
      lifecycleStages: LIFECYCLE_STAGES,
    });
  } catch (err) {
    console.error('[projects] get error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

// PATCH /api/projects/:id/status  (UNIVERSITY/GOVERNMENT)
async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['TEAM_FORMATION', 'PROTOTYPE', 'TESTING', 'PILOT', 'DEPLOYMENT', 'COMPLETED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const result = await db.query(
      `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Project not found' });

    if (status === 'DEPLOYMENT') {
      const project = result.rows[0];
      await db.query(`UPDATE challenges SET status = 'DEPLOYED', updated_at = NOW() WHERE id = $1`, [project.challenge_id]);
    }

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1,'UPDATE_PROJECT_STATUS','project',$2,$3)`,
      [req.user.id, id, JSON.stringify({ status })]
    );

    res.json({ project: result.rows[0] });
  } catch (err) {
    console.error('[projects] updateStatus error:', err);
    res.status(500).json({ error: 'Failed to update project status' });
  }
}

// POST /api/projects/:id/impact  (UNIVERSITY/GOVERNMENT) - record measured impact
async function recordImpact(req, res) {
  const { id } = req.params;
  const { beneficiaries, schoolsReached, unsafeUsageReductionPct, estimatedAnnualSavings, communitySatisfactionPct } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO impact_metrics
        (project_id, beneficiaries, schools_reached, unsafe_usage_reduction_pct, estimated_annual_savings, community_satisfaction_pct)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, beneficiaries, schoolsReached, unsafeUsageReductionPct, estimatedAnnualSavings, communitySatisfactionPct]
    );
    res.status(201).json({ impact: result.rows[0] });
  } catch (err) {
    console.error('[projects] recordImpact error:', err);
    res.status(500).json({ error: 'Failed to record impact metrics' });
  }
}

module.exports = { getProject, updateStatus, recordImpact };
