import { CandidateData, CachedCandidate } from '../types/index.js';

export class CacheService {
  private currentCandidate: CandidateData | null = null;
  private candidateCache: Map<string, CachedCandidate> = new Map();
  private readonly TTL = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Set the current candidate (from webhook event)
   */
  setCurrentCandidate(data: CandidateData): void {
    this.currentCandidate = data;
    this.setCachedCandidate(data.identifier, data);
    console.log(`Current candidate set: ${data.identifier}`);
  }

  /**
   * Get the most recently transferred candidate
   */
  getCurrentCandidate(): CandidateData | null {
    return this.currentCandidate;
  }

  /**
   * Get cached candidate by identifier
   */
  getCachedCandidate(identifier: string): CandidateData | null {
    const cached = this.candidateCache.get(identifier);

    if (!cached) {
      return null;
    }

    // Check if cache is still valid (TTL)
    const now = Date.now();
    if (now - cached.timestamp > this.TTL) {
      console.log(`Cache expired for ${identifier}`);
      this.candidateCache.delete(identifier);
      return null;
    }

    console.log(`Cache hit for ${identifier}`);
    return cached.data;
  }

  /**
   * Store candidate in cache
   */
  setCachedCandidate(identifier: string, data: CandidateData): void {
    this.candidateCache.set(identifier, {
      data,
      timestamp: Date.now()
    });
    console.log(`Cached candidate: ${identifier}`);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.candidateCache.forEach((cached, key) => {
      if (now - cached.timestamp > this.TTL) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.candidateCache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cleared ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.candidateCache.size,
      currentCandidate: this.currentCandidate?.identifier || null
    };
  }
}
