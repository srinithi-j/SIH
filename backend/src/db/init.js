const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// Runs schema.sql then seed.sql against the configured PostgreSQL database.
// Both files are idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING) so this
// is safe to run every time the server boots in the demo/dev environment.
async function initDatabase() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const seedPath = path.join(__dirname, '../../../database/seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schemaSql);
  console.log('[db] schema ensured');

  try {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await db.query(seedSql);
    console.log('[db] seed data ensured');
  } catch (err) {
    console.warn('[db] seed step skipped/partial:', err.message);
  }
}

module.exports = initDatabase;
