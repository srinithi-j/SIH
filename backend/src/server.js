const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const initDatabase = require('./db/init');
const authRoutes = require('./routes/auth.routes');
const challengesRoutes = require('./routes/challenges.routes');
const universityRoutes = require('./routes/university.routes');
const industryRoutes = require('./routes/industry.routes');
const projectsRoutes = require('./routes/projects.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sih-portal-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Central error handler (keeps controllers free of try/catch boilerplate leaks)
app.use((err, req, res, next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.error('[db] initialization failed — is PostgreSQL running and DATABASE_URL correct?', err.message);
    console.error('[db] server will still start, but requests requiring the DB will fail.');
  }

  app.listen(PORT, () => {
    console.log(`SIH Portal backend listening on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
