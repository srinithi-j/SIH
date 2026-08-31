const { Pool } = require('pg');
require('dotenv').config();

// Central PostgreSQL connection pool.
// Uses DATABASE_URL if present (docker-compose / prod style),
// otherwise falls back to discrete PG* vars.
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'sih_user',
        password: process.env.PGPASSWORD || 'sih_password',
        database: process.env.PGDATABASE || 'sih_portal',
      }
);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
