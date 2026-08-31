// Generates human-readable challenge codes like CH-JH-2026-001
// stateCode: short uppercase code (defaults to XX if not provided)
async function generateChallengeCode(db, stateCode = 'XX') {
  const year = new Date().getFullYear();
  const prefix = `CH-${stateCode.toUpperCase()}-${year}-`;

  const result = await db.query(
    `SELECT challenge_code FROM challenges
     WHERE challenge_code LIKE $1
     ORDER BY challenge_code DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNumber = 1;
  if (result.rows.length > 0) {
    const lastCode = result.rows[0].challenge_code;
    const lastNumber = parseInt(lastCode.split('-').pop(), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

module.exports = { generateChallengeCode };
