const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gets vector embedding for the given text using Gemini text-embedding-004 model.
 * @param {string} text 
 * @returns {Promise<number[]>} Array of numbers representing the embedding
 */
async function getEmbedding(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Using local fallback embedding generator.');
      return getFallbackEmbedding(text);
    }
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error fetching embedding from Gemini API:', error.message || error);
    if (!process.env.GEMINI_API_KEY) {
      return getFallbackEmbedding(text);
    }
    throw error;
  }
}

/**
 * Fallback embedding generator for offline testing when GEMINI_API_KEY is not configured.
 */
function getFallbackEmbedding(text) {
  const dim = 64;
  const vec = new Array(dim).fill(0);
  if (!text) return vec;
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  });
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map(v => v / magnitude);
}

/**
 * Computes cosine similarity between two equal-length numeric vectors.
 * Returns a number between -1 and 1.
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new Error('Both inputs to cosineSimilarity must be arrays.');
  }
  if (vecA.length === 0 || vecB.length === 0) {
    throw new Error('Vector arrays cannot be empty.');
  }
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector lengths must match. Got ${vecA.length} and ${vecB.length}.`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Maps similarity (-1 to 1) to a 0-100 integer score.
 */
function mapSimilarityToScore(similarity) {
  return Math.round(((similarity + 1) / 2) * 100);
}

/**
 * Computes match score (0-100) between resume text and job text.
 */
async function computeMatchScore(resumeText, jobText) {
  const vecA = await getEmbedding(resumeText);
  const vecB = await getEmbedding(jobText);
  const similarity = cosineSimilarity(vecA, vecB);
  return mapSimilarityToScore(similarity);
}

module.exports = {
  getEmbedding,
  cosineSimilarity,
  mapSimilarityToScore,
  computeMatchScore
};
