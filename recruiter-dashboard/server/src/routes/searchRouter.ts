import express from 'express';
import { CandidateAggregator } from '../services/CandidateAggregator.js';
import { CandidateSearchResult } from '../types/index.js';

export function createSearchRouter(aggregator: CandidateAggregator): express.Router {
  const router = express.Router();

  /**
   * GET /api/search?q=query
   * Search for candidates by email, phone, or name
   */
  router.get('/', async (req, res) => {
    try {
      let query = req.query.q as string;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          error: 'Missing query parameter',
          message: 'Please provide a search query with ?q=...'
        });
      }

      // Trim whitespace but preserve special characters like +
      query = query.trim();

      console.log(`API request: GET /api/search?q=${query}`);

      const candidates = await aggregator.searchCandidates(query);

      // Transform to search result format
      const results: CandidateSearchResult[] = candidates.map(candidate => {
        // Clean up identifier for display
        let displayEmail = candidate.profile.traits.email;

        if (candidate.identifier.includes('@')) {
          // Remove prefix like "email:" or "user_id:"
          displayEmail = candidate.identifier.replace(/^(email|user_id):/, '');
        }

        return {
          identifier: candidate.identifier,
          name: `${candidate.profile.traits.firstName || ''} ${candidate.profile.traits.lastName || ''}`.trim(),
          email: displayEmail || candidate.profile.traits.email,
          phone: candidate.profile.traits.phone,
          profession: candidate.profile.traits.profession,
          lastActivity: candidate.events.length > 0
            ? candidate.events[0].timestamp
            : candidate.lastUpdated
        };
      });

      res.json(results);
    } catch (error: any) {
      console.error('Error searching candidates:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  });

  return router;
}
