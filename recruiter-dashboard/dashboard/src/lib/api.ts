import { CandidateData, CandidateSearchResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  /**
   * Search for candidates by email, phone, or name
   */
  async search(query: string): Promise<CandidateSearchResult[]> {
    const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get full candidate details by identifier
   */
  async getCandidateDetail(identifier: string): Promise<CandidateData> {
    const response = await fetch(`${API_BASE}/api/candidates/${encodeURIComponent(identifier)}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Candidate not found');
      }
      throw new Error(`Failed to load candidate: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get the most recently transferred candidate (from webhook)
   */
  async getCurrentCandidate(): Promise<CandidateData | null> {
    const response = await fetch(`${API_BASE}/api/candidates/current`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to load current candidate: ${response.statusText}`);
    }

    return response.json();
  }
};
