const db = require('../config/db');

// GET /api/industry/projects  (INDUSTRY) - projects seeking support
async function projectsSeekingSupport(req, res) {
  try {
    const result = await db.query(
      `SELECT p.*, c.title AS challenge_title, c.domain
       FROM projects p JOIN challenges c ON c.id = p.challenge_id
       WHERE p.status IN ('TEAM_FORMATION','PROTOTYPE','TESTING','PILOT')
       ORDER BY p.updated_at DESC`
    );
    res.json({ projects: result.rows });
  } catch (err) {
    console.error('[industry] projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

// POST /api/industry/projects/:id/interest  (INDUSTRY)
// interestType: EXPRESS_INTEREST | MENTORSHIP | RESOURCES | FUNDING
async function expressInterest(req, res) {
  const { id } = req.params;
  const { interestType, message } = req.body;

  try {
    const partnerResult = await db.query('SELECT id FROM industry_partners WHERE organization_id = $1', [req.user.organizationId]);
    let partnerId = partnerResult.rows[0]?.id;

    if (!partnerId) {
      const created = await db.query(
        `INSERT INTO industry_partners (organization_id, name, sector, contact_email)
         VALUES ($1,$2,'General',$3) RETURNING id`,
        [req.user.organizationId, req.user.name, req.user.email]
      );
      partnerId = created.rows[0].id;
    }

    const result = await db.query(
      `INSERT INTO industry_interest (project_id, industry_partner_id, interest_type, message)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, partnerId, interestType || 'EXPRESS_INTEREST', message || null]
    );

    if (!req.body.__skipStatusBump) {
      await db.query(`UPDATE projects SET industry_partner_id = $1, updated_at = NOW() WHERE id = $2`, [partnerId, id]);
    }

    res.status(201).json({ interest: result.rows[0] });
  } catch (err) {
    console.error('[industry] expressInterest error:', err);
    res.status(500).json({ error: 'Failed to record interest' });
  }
}

module.exports = { projectsSeekingSupport, expressInterest };
