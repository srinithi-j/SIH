const db = require('../config/db');

// GET /api/analytics/government  (GOVERNMENT) - command dashboard
async function governmentAnalytics(req, res) {
  try {
    const [
      totalChallenges, validated, activeProjects, completedProjects,
      prototypes, deployed, hei, students, faculty, industryPartners, beneficiaries,
      pendingValidation, highPriority,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM challenges'),
      db.query(`SELECT COUNT(*) FROM challenges WHERE status NOT IN ('SUBMITTED','AI_ANALYSIS','PENDING_VALIDATION','REJECTED')`),
      db.query(`SELECT COUNT(*) FROM projects WHERE status NOT IN ('COMPLETED')`),
      db.query(`SELECT COUNT(*) FROM projects WHERE status = 'COMPLETED'`),
      db.query(`SELECT COUNT(*) FROM projects WHERE status = 'PROTOTYPE'`),
      db.query(`SELECT COUNT(*) FROM challenges WHERE status = 'DEPLOYED'`),
      db.query('SELECT COUNT(*) FROM universities'),
      db.query('SELECT COALESCE(SUM(students_count),0) AS total FROM universities'),
      db.query('SELECT COALESCE(SUM(faculty_count),0) AS total FROM universities'),
      db.query('SELECT COUNT(*) FROM industry_partners'),
      db.query('SELECT COALESCE(SUM(beneficiaries),0) AS total FROM impact_metrics'),
      db.query(`SELECT COUNT(*) FROM challenges WHERE status = 'PENDING_VALIDATION'`),
      db.query(`SELECT COUNT(*) FROM challenge_ai_analysis WHERE priority = 'High'`),
    ]);

    res.json({
      totalChallenges: Number(totalChallenges.rows[0].count),
      pendingValidation: Number(pendingValidation.rows[0].count),
      highPriority: Number(highPriority.rows[0].count),
      validatedChallenges: Number(validated.rows[0].count),
      activeProjects: Number(activeProjects.rows[0].count),
      completedProjects: Number(completedProjects.rows[0].count),
      prototypes: Number(prototypes.rows[0].count),
      deployedSolutions: Number(deployed.rows[0].count),
      participatingHEIs: Number(hei.rows[0].count),
      students: Number(students.rows[0].total),
      faculty: Number(faculty.rows[0].total),
      industryPartners: Number(industryPartners.rows[0].count),
      beneficiaries: Number(beneficiaries.rows[0].total),
    });
  } catch (err) {
    console.error('[analytics] government error:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
}

module.exports = { governmentAnalytics };
