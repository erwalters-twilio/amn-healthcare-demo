// @ts-nocheck
import { SegmentService } from './SegmentService.js';
import { TwilioService } from './TwilioService.js';
import { CandidateData } from '../types/index.js';

export class CandidateAggregator {
  private segmentService: SegmentService;
  private twilioService: TwilioService;

  constructor(segmentService: SegmentService, twilioService: TwilioService) {
    this.segmentService = segmentService;
    this.twilioService = twilioService;
  }

  /**
   * Fetch and aggregate all candidate data from multiple sources
   */
  async fetchCandidateData(identifier: string): Promise<CandidateData> {
    console.log(`Fetching candidate data for: ${identifier}`);

    // Fetch Segment profile and events in parallel
    const [profile, events] = await Promise.all([
      this.segmentService.getProfile(identifier),
      this.segmentService.getEvents(identifier, 50)
    ]);

    if (!profile) {
      throw new Error(`No profile found for identifier: ${identifier}`);
    }

    // Extract phone number from profile for Twilio lookups
    const phone = this.segmentService.extractPhone(profile);

    let conversations = [];
    let memoryProfile = null;

    if (phone) {
      // Fetch Memory profile first to get conversation IDs
      memoryProfile = await this.twilioService.getMemoryProfileByPhone(phone);

      // If we have Memory observations, extract conversation IDs and fetch those conversations
      if (memoryProfile && memoryProfile.observations.length > 0) {
        const conversationIds = new Set<string>();

        // Extract unique conversation IDs from observations
        memoryProfile.observations.forEach(obs => {
          if ((obs as any).conversationIds) {
            (obs as any).conversationIds.forEach((id: string) => conversationIds.add(id));
          }
        });

        if (conversationIds.size > 0) {
          console.log(`Found ${conversationIds.size} conversation IDs in Memory observations`);
          // Fetch conversations by their IDs
          conversations = await this.twilioService.getConversationsByIds(Array.from(conversationIds));
        } else {
          // Fallback: try finding conversations by phone
          conversations = await this.twilioService.findConversationsByPhone(phone);
        }
      } else {
        // No Memory profile or observations, try finding conversations by phone
        conversations = await this.twilioService.findConversationsByPhone(phone);
      }
    } else {
      console.warn('No phone number found in profile, skipping Twilio data fetch');
    }

    // Extract application context from profile traits
    const applicationContext = {
      job_applied: profile.traits.job_applied,
      application_id: profile.traits.application_id,
      abandonment_step: profile.traits.abandonment_step
    };

    const candidateData: CandidateData = {
      identifier,
      profile,
      events,
      conversations,
      memoryProfile,
      applicationContext,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Successfully aggregated data for ${identifier}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Conversations: ${conversations.length}`);
    console.log(`- Memory profile: ${memoryProfile ? 'Yes' : 'No'}`);

    return candidateData;
  }

  /**
   * Search for candidates by query (email, phone, or name)
   * Note: This is a simple implementation. For production, consider using Segment's
   * Profiles Sync API or a dedicated search index.
   */
  async searchCandidates(query: string): Promise<CandidateData[]> {
    console.log(`Searching candidates with query: ${query}`);

    const results: CandidateData[] = [];

    // If query looks like an email, try multiple identifier types
    if (query.includes('@')) {
      const identifiersToTry = [
        `user_id:${query}`,  // Try user_id first (most common)
        `email:${query}`,    // Then email
        query                // Then raw (will be normalized to email:)
      ];

      for (const identifier of identifiersToTry) {
        try {
          const data = await this.fetchCandidateData(identifier);
          // Check if we already have this profile (by traits)
          const isDuplicate = results.some(r =>
            r.profile.traits.email === data.profile.traits.email &&
            r.profile.traits.phone === data.profile.traits.phone
          );
          if (!isDuplicate) {
            results.push(data);
          }
        } catch (error) {
          console.log(`No match found for identifier: ${identifier}`);
        }
      }
    } else if (query.startsWith('+') || /^\d+$/.test(query)) {
      // Phone number - try multiple identifier types including anonymous_id
      let normalizedPhone = query;

      // Normalize phone to E.164 format if needed
      if (!query.startsWith('+')) {
        // No + prefix, add country code
        normalizedPhone = query.length === 10 ? `+1${query}` : `+${query}`;
      }
      // If already has +, use as-is

      const identifiersToTry = [
        `anonymous_id:${normalizedPhone}`, // Try anonymous_id first (most common for phone tracking)
        `phone:${normalizedPhone}`,        // Try phone trait
        `user_id:${normalizedPhone}`,      // Try user_id
        normalizedPhone                     // Then raw (will be normalized to phone:)
      ];

      for (const identifier of identifiersToTry) {
        try {
          const data = await this.fetchCandidateData(identifier);
          // Check if we already have this profile (by traits)
          const isDuplicate = results.some(r =>
            r.profile.traits.email === data.profile.traits.email &&
            r.profile.traits.phone === data.profile.traits.phone
          );
          if (!isDuplicate) {
            results.push(data);
          }
        } catch (error) {
          console.log(`No match found for identifier: ${identifier}`);
        }
      }
    } else {
      // Try exact match by other identifier
      try {
        const data = await this.fetchCandidateData(query);
        results.push(data);
      } catch (error) {
        console.log(`No exact match found for: ${query}`);
      }
    }

    // For name searches, we would need additional indexing
    return results;
  }
}
