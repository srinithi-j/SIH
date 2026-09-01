const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const initDatabase = require('./db/init');
const authRoutes = require('./routes/auth.routes');
const challengesRoutes = require('./routes/challenges.routes');
const universityRoutes = require('./routes/university.routes');
const industryRoutes = require('./routes/industry.routes');
const projectsRoutes = require('./routes/projects.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/pdf' ||
                     file.mimetype === 'application/msword' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, DOCX are allowed.'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

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

const PORT = process.env.PORT || 5001;

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
