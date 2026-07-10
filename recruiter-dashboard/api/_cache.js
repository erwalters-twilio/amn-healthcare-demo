// Simple in-memory cache for current candidate
// Note: This is per-function instance, so it may not persist between cold starts
let currentCandidate = null;
let lastUpdated = null;

module.exports = {
  getCurrentCandidate() {
    return currentCandidate;
  },

  setCurrentCandidate(data) {
    currentCandidate = data;
    lastUpdated = new Date().toISOString();
  },

  getLastUpdated() {
    return lastUpdated;
  },

  clear() {
    currentCandidate = null;
    lastUpdated = null;
  }
};
