const cache = require('../_cache');

module.exports = async (req, res) => {
  try {
    // Check if there's a cached current candidate
    const cachedCandidate = cache.getCurrentCandidate();

    if (cachedCandidate) {
      return res.status(200).json(cachedCandidate);
    }

    // No current candidate set
    return res.status(404).json({
      error: 'No current candidate',
      message: 'No candidate has been transferred yet'
    });
  } catch (error) {
    console.error('Current candidate error:', error);
    res.status(500).json({
      error: 'Failed to fetch current candidate',
      message: error.message
    });
  }
};
