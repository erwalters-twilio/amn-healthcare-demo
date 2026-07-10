// @ts-nocheck
import { SegmentProfile, SegmentEvent } from '../types/index.js';

export class SegmentService {
  private profileToken: string;
  private spaceId: string;
  private baseUrl: string;

  constructor() {
    this.profileToken = process.env.SEGMENT_PROFILE_TOKEN || '';
    this.spaceId = process.env.SEGMENT_SPACE_ID || '';
    this.baseUrl = `https://profiles.segment.com/v1/spaces/${this.spaceId}/collections/users/profiles`;

    if (!this.profileToken || !this.spaceId) {
      console.warn('Segment Profile API credentials not configured');
    }
  }

  /**
   * Get profile by identifier (email, phone, or user_id)
   * Identifier format: "email:john@example.com", "phone:+13304027149", "user_id:123"
   */
  async getProfile(identifier: string): Promise<SegmentProfile | null> {
    try {
      // Normalize identifier format
      const normalizedIdentifier = this.normalizeIdentifier(identifier);

      const url = `${this.baseUrl}/${encodeURIComponent(normalizedIdentifier)}/traits`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.profileToken + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Profile not found for identifier: ${identifier}`);
          return null;
        }
        throw new Error(`Segment API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { traits: data.traits || {} };
    } catch (error) {
      console.error('Error fetching Segment profile:', error);
      return null;
    }
  }

  /**
   * Get recent events for a profile
   */
  async getEvents(identifier: string, limit: number = 50): Promise<SegmentEvent[]> {
    try {
      const normalizedIdentifier = this.normalizeIdentifier(identifier);

      const url = `${this.baseUrl}/${encodeURIComponent(normalizedIdentifier)}/events?limit=${limit}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.profileToken + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Segment API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Segment Profile API returns events in data.data array
      const events = data.data || data.events || [];

      // Transform to our SegmentEvent format
      return events.map((event: any) => ({
        name: event.event,
        properties: event.properties || {},
        timestamp: event.timestamp
      }));
    } catch (error) {
      console.error('Error fetching Segment events:', error);
      return [];
    }
  }

  /**
   * Normalize identifier to Segment format
   * Input: "+13304027149", "john@example.com", "phone:+13304027149"
   * Output: "phone:+13304027149", "email:john@example.com"
   */
  private normalizeIdentifier(identifier: string): string {
    // Already in correct format
    if (identifier.includes(':')) {
      return identifier;
    }

    // Email
    if (identifier.includes('@')) {
      return `email:${identifier}`;
    }

    // Phone (starts with + or digits)
    if (identifier.startsWith('+') || /^\d+$/.test(identifier)) {
      // Normalize to E.164 if needed
      let phone = identifier;
      if (!phone.startsWith('+')) {
        phone = phone.length === 10 ? `+1${phone}` : `+${phone}`;
      }
      return `phone:${phone}`;
    }

    // Default to user_id
    return `user_id:${identifier}`;
  }

  /**
   * Extract phone number from profile traits
   */
  extractPhone(profile: SegmentProfile | null): string | null {
    if (!profile || !profile.traits) return null;
    return profile.traits.phone || null;
  }

  /**
   * Extract email from profile traits
   */
  extractEmail(profile: SegmentProfile | null): string | null {
    if (!profile || !profile.traits) return null;
    return profile.traits.email || null;
  }
}
