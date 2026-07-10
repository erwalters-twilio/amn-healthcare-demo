import express from 'express';
import { CandidateAggregator } from '../services/CandidateAggregator.js';
import { CacheService } from '../services/CacheService.js';

export function createWebhookRouter(
  aggregator: CandidateAggregator,
  cache: CacheService
): express.Router {
  const router = express.Router();

  /**
   * POST /webhooks/segment
   * Receives "Call Transferred to Recruiter" events from Segment
   */
  router.post('/segment', async (req, res) => {
    try {
      console.log('Received Segment webhook:', JSON.stringify(req.body, null, 2));

      const { userId, event, properties } = req.body;

      // Validate webhook payload
      if (!event || event !== 'Call Transferred to Recruiter') {
        console.log(`Ignoring non-transfer event: ${event}`);
        return res.status(200).json({ message: 'Event ignored' });
      }

      // Extract phone number from properties
      const phone = properties?.phone || properties?.from || userId;

      if (!phone) {
        console.error('No phone number found in webhook payload');
        return res.status(400).json({
          error: 'Missing phone number',
          message: 'Webhook payload must include phone number'
        });
      }

      console.log(`Processing call transfer for: ${phone}`);

      // Fetch all candidate data
      const candidateData = await aggregator.fetchCandidateData(phone);

      // Set as current candidate
      cache.setCurrentCandidate(candidateData);

      console.log('✅ Candidate data fetched and cached successfully');

      res.status(200).json({
        success: true,
        message: 'Candidate data fetched and ready',
        identifier: phone
      });
    } catch (error: any) {
      console.error('Error processing Segment webhook:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error.message
      });
    }
  });

  /**
   * GET /webhooks/health
   * Health check endpoint
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: cache.getCacheStats()
    });
  });

  return router;
}
