const cache = require('../_cache');

module.exports = async (req, res) => {
  try {
    console.log('Received Segment webhook:', JSON.stringify(req.body, null, 2));

    const { userId, anonymousId, event, properties } = req.body;

    // Validate webhook payload
    if (!event || event !== 'Call Transferred to Recruiter') {
      console.log(`Ignoring non-transfer event: ${event}`);
      return res.status(200).json({ message: 'Event ignored' });
    }

    // Extract phone number from properties or anonymousId
    const phone = properties?.phone || properties?.from || anonymousId || userId;

    if (!phone) {
      console.error('No phone number found in webhook payload');
      return res.status(400).json({
        error: 'Missing phone number',
        message: 'Webhook payload must include phone number'
      });
    }

    console.log(`Processing call transfer for: ${phone}`);

    // Dynamically import ES module services from compiled dist
    const { SegmentService } = await import('../../server/dist/services/SegmentService.js');
    const { CandidateAggregator } = await import('../../server/dist/services/CandidateAggregator.js');
    const { TwilioService } = await import('../../server/dist/services/TwilioService.js');

    const segmentService = new SegmentService();
    const twilioService = new TwilioService();
    const aggregator = new CandidateAggregator(segmentService, twilioService);

    // Fetch all candidate data
    const candidateData = await aggregator.fetchCandidateData(phone);

    // Set as current candidate in cache (ephemeral - won't persist)
    cache.setCurrentCandidate(candidateData);

    console.log('✅ Candidate data fetched and cached successfully');

    // Generate dashboard URL with the identifier
    const dashboardUrl = `https://amn-recruiter-dashboard.vercel.app?candidate=${encodeURIComponent(candidateData.identifier)}`;

    res.status(200).json({
      success: true,
      message: 'Candidate data fetched and ready',
      identifier: candidateData.identifier, // Use the full Segment identifier
      dashboardUrl: dashboardUrl,
      note: 'Open this URL in your browser to view the candidate profile'
    });
  } catch (error) {
    console.error('Error processing Segment webhook:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
};
