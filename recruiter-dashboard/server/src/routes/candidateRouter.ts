import express from 'express';
import { CandidateAggregator } from '../services/CandidateAggregator.js';
import { CacheService } from '../services/CacheService.js';

export function createCandidateRouter(
  aggregator: CandidateAggregator,
  cache: CacheService
): express.Router {
  const router = express.Router();

  /**
   * GET /api/candidates/current
   * Get the most recently transferred candidate (from webhook event)
   * MUST be defined before /:identifier to avoid conflict
   */
  router.get('/current', (req, res) => {
    console.log('API request: GET /api/candidates/current');

    const current = cache.getCurrentCandidate();

    if (!current) {
      return res.status(404).json({
        error: 'No current candidate',
        message: 'No candidate has been transferred yet'
      });
    }

    res.json(current);
  });

  /**
   * GET /api/candidates/:identifier
   * Fetch full candidate details by identifier (email, phone, or user_id)
   */
  router.get('/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;

      console.log(`API request: GET /api/candidates/${identifier}`);

      // Check cache first
      const cached = cache.getCachedCandidate(identifier);
      if (cached) {
        console.log('Returning cached data');
        return res.json(cached);
      }

      // Fetch fresh data
      const data = await aggregator.fetchCandidateData(identifier);

      // Cache the result
      cache.setCachedCandidate(identifier, data);

      res.json(data);
    } catch (error: any) {
      console.error('Error fetching candidate:', error);
      res.status(404).json({
        error: 'Candidate not found',
        message: error.message
      });
    }
  });

  return router;
}
