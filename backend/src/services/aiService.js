const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

function buildLocalMatchFallback(challenge) {
  const text = `${challenge.title || ''} ${challenge.description || ''} ${challenge.domain || ''}`.toLowerCase();

  return db.query(
    `SELECT u.id AS university_id, u.name, ARRAY_AGG(ue.domain) AS expertise
     FROM universities u
     LEFT JOIN university_expertise ue ON ue.university_id = u.id
     GROUP BY u.id, u.name
     ORDER BY u.id`
  ).then(({ rows }) => {
    const matches = rows
      .map((row) => {
        const expertise = Array.isArray(row.expertise) ? row.expertise.filter(Boolean) : [];
        const hits = expertise.filter((item) => {
          const normalized = String(item).toLowerCase();
          return normalized && (text.includes(normalized) || text.includes(normalized.replace(/\s+/g, '')) || normalized.split(/\s+/).some((word) => word.length > 3 && text.includes(word)));
        });

        const base = 60 + hits.length * 12;
        const score = Math.min(97, base + (text.includes('water') && expertise.some((item) => /water|environment|public health/i.test(item)) ? 8 : 0));

        const reasons = hits.length
          ? hits.slice(0, 3)
          : expertise.slice(0, 2).length
            ? expertise.slice(0, 2)
            : ['Relevant domain expertise'];

        return {
          university_id: row.university_id,
          university_name: row.name,
          match_score: Number(Math.max(65, Math.min(97, score)).toFixed(1)),
          reasons,
        };
      })
      .filter((match) => match.match_score >= 65)
      .sort((a, b) => b.match_score - a.match_score);

    return { matches };
  });
}

// Thin client wrapping the Python FastAPI AI microservice.
// If the AI service is unreachable, callers should fall back to a safe
// mock so the demo flow never breaks end-to-end.
const aiService = {
  async analyzeChallenge(challenge) {
    try {
      const { data } = await axios.post(`${AI_BASE_URL}/analyze`, challenge, { timeout: 5000 });
      return data;
    } catch (err) {
      console.warn('[aiService] /analyze unreachable, using local mock:', err.message);
      return {
        domain: challenge.domain || 'General',
        priority: 'Medium',
        severity_score: 6.5,
        impact_score: 6.0,
        required_skills: ['Community Engagement', 'Data Analytics'],
      };
    }
  },

  async findSimilar(challenge) {
    try {
      const { data } = await axios.post(`${AI_BASE_URL}/similar`, challenge, { timeout: 5000 });
      return data;
    } catch (err) {
      console.warn('[aiService] /similar unreachable:', err.message);
      return { similar_challenges: [] };
    }
  },

  async matchHEIs(challenge) {
    try {
      const { data } = await axios.post(`${AI_BASE_URL}/match-heis`, challenge, { timeout: 5000 });
      return data;
    } catch (err) {
      console.warn('[aiService] /match-heis unreachable, using local fallback:', err.message);
      try {
        return await buildLocalMatchFallback(challenge);
      } catch (fallbackErr) {
        console.error('[aiService] fallback match failed:', fallbackErr.message);
        return { matches: [] };
      }
    }
  },
};

module.exports = aiService;
