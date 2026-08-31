const axios = require('axios');
require('dotenv').config();

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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
      console.warn('[aiService] /match-heis unreachable:', err.message);
      return { matches: [] };
    }
  },
};

module.exports = aiService;
