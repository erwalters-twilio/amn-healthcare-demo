module.exports = async (req, res) => {
  try {
    const query = req.query.q || '';

    if (!query || query.length < 2) {
      return res.status(200).json([]);
    }

    // Dynamically import ES module services from compiled dist
    const { SegmentService } = await import('../server/dist/services/SegmentService.js');
    const { CandidateAggregator } = await import('../server/dist/services/CandidateAggregator.js');
    const { TwilioService } = await import('../server/dist/services/TwilioService.js');

    const segmentService = new SegmentService();
    const twilioService = new TwilioService();
    const aggregator = new CandidateAggregator(segmentService, twilioService);

    // Search using the aggregator - returns full CandidateData[]
    const fullResults = await aggregator.searchCandidates(query);

    // Transform to search result format for dropdown
    // IMPORTANT: Keep the exact identifier used to fetch this profile so we can retrieve it again
    const searchResults = fullResults.map(candidate => ({
      identifier: candidate.identifier, // Use the exact Segment identifier (e.g., "anonymous_id:+13304027149")
      name: `${candidate.profile.traits.firstName || ''} ${candidate.profile.traits.lastName || ''}`.trim() || 'Unknown',
      email: candidate.profile.traits.email || '',
      phone: candidate.profile.traits.phone || '',
      profession: candidate.profile.traits.profession || candidate.profile.traits.specialty || ''
    }));

    res.status(200).json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
};
