module.exports = async (req, res) => {
  try {
    const { identifier } = req.query;

    if (!identifier) {
      return res.status(400).json({
        error: 'Missing identifier',
        message: 'Candidate identifier is required'
      });
    }

    // Dynamically import ES module services from compiled dist
    const { SegmentService } = await import('../../server/dist/services/SegmentService.js');
    const { CandidateAggregator } = await import('../../server/dist/services/CandidateAggregator.js');
    const { TwilioService } = await import('../../server/dist/services/TwilioService.js');

    const segmentService = new SegmentService();
    const twilioService = new TwilioService();
    const aggregator = new CandidateAggregator(segmentService, twilioService);

    // Fetch full candidate data
    const candidateData = await aggregator.fetchCandidateData(identifier);

    res.status(200).json(candidateData);
  } catch (error) {
    console.error('Candidate fetch error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Candidate not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch candidate',
      message: error.message
    });
  }
};
