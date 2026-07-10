// @ts-nocheck
import twilio from 'twilio';
import {
  TwilioConversation,
  TwilioMessage,
  MemoryProfile,
  MemoryObservation,
  MemorySummary
} from '../types/index.js';

export class TwilioService {
  private client: any;
  private memoryStoreId: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.memoryStoreId = process.env.MEMORY_STORE_ID || '';

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured');
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Find conversations by participant phone number
   */
  async findConversationsByPhone(phoneNumber: string): Promise<TwilioConversation[]> {
    try {
      if (!this.client) {
        console.warn('Twilio client not initialized');
        return [];
      }

      // Normalize phone to E.164
      const normalizedPhone = this.normalizePhone(phoneNumber);

      console.log(`Searching conversations for phone: ${normalizedPhone}`);

      // Find participant conversations using v1 API
      const participantConversations = await this.client.conversations.v1
        .participantConversations
        .list({ address: normalizedPhone, limit: 50 });

      console.log(`Found ${participantConversations.length} conversations for ${normalizedPhone}`);

      const conversations: TwilioConversation[] = [];

      for (const pc of participantConversations) {
        try {
          // Fetch full conversation details
          const conversation = await this.client.conversations.v1
            .conversations(pc.conversationSid)
            .fetch();

          // Fetch messages (increased limit)
          const messages = await this.getConversationMessages(pc.conversationSid);

          conversations.push({
            sid: conversation.sid,
            friendlyName: conversation.friendlyName || `Conversation ${conversation.sid.slice(-8)}`,
            attributes: conversation.attributes ? JSON.parse(conversation.attributes) : {},
            messages
          });
        } catch (err) {
          console.error(`Error fetching conversation ${pc.conversationSid}:`, err);
        }
      }

      return conversations;
    } catch (error) {
      console.error('Error finding conversations by phone:', error);
      return [];
    }
  }

  /**
   * Get conversations by their Conversation Orchestrator IDs
   */
  async getConversationsByIds(conversationIds: string[]): Promise<TwilioConversation[]> {
    try {
      const conversations: TwilioConversation[] = [];

      for (const convId of conversationIds) {
        try {
          // Fetch conversation from Intelligence API v3
          const url = `https://intelligence.twilio.com/v3/Conversations/${convId}`;

          const response = await fetch(url, {
            headers: {
              'Authorization': `Basic ${Buffer.from(
                process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
              ).toString('base64')}`
            }
          });

          if (!response.ok) {
            console.error(`Error fetching conversation ${convId}: ${response.status}`);
            continue;
          }

          const convData = await response.json();

          // Extract messages from communications array
          const messages: TwilioMessage[] = [];
          const communications = convData.communications || [];

          communications.forEach((comm: any) => {
            // Find participant info
            const participant = (convData.participants || []).find(
              (p: any) => p.id === comm.participantId
            );

            const participantName = participant?.name || participant?.type || 'unknown';
            const messageText = comm.content?.text || '';

            if (messageText) {
              messages.push({
                sid: comm.id,
                author: participantName,
                body: messageText,
                dateCreated: new Date(comm.createdAt),
                attributes: JSON.stringify({
                  participantId: comm.participantId,
                  participantType: participant?.type
                })
              });
            }
          });

          conversations.push({
            sid: convId,
            friendlyName: convData.name || `Conversation ${convId.slice(-8)}`,
            attributes: {
              status: convData.status,
              channels: convData.channels,
              participants: convData.participants
            },
            messages
          });

          console.log(`Fetched conversation ${convId} with ${messages.length} messages`);
        } catch (err) {
          console.error(`Error processing conversation ${convId}:`, err);
        }
      }

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations by IDs:', error);
      return [];
    }
  }

  /**
   * Get all messages from a conversation
   */
  async getConversationMessages(conversationSid: string): Promise<TwilioMessage[]> {
    try {
      if (!this.client) return [];

      const messages = await this.client.conversations.v1
        .conversations(conversationSid)
        .messages
        .list({ limit: 100, order: 'asc' });

      return messages.map((msg: any) => ({
        sid: msg.sid,
        author: msg.author || 'unknown',
        body: msg.body || '',
        dateCreated: msg.dateCreated,
        attributes: msg.attributes || '{}'
      }));
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationSid}:`, error);
      return [];
    }
  }

  /**
   * Lookup Memory profile by phone number using Recall API
   * Lists profiles and matches by phone, then uses Recall for observations + summaries
   */
  async getMemoryProfileByPhone(phoneNumber: string): Promise<MemoryProfile | null> {
    try {
      if (!this.memoryStoreId) {
        console.warn('Memory Store ID not configured');
        return null;
      }

      const normalizedPhone = this.normalizePhone(phoneNumber);

      // Step 1: List all profiles in the Memory Store
      const listUrl = `https://memory.twilio.com/v1/Stores/${this.memoryStoreId}/Profiles`;

      const listResponse = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
          ).toString('base64')}`
        }
      });

      if (!listResponse.ok) {
        console.error(`Memory API list error: ${listResponse.status}`);
        return null;
      }

      const listData = await listResponse.json();
      const profileIds = listData.profiles || [];

      if (profileIds.length === 0) {
        console.log('No profiles in Memory Store');
        return null;
      }

      // Step 2: Find profile matching phone number
      let matchingProfileId: string | null = null;

      for (const profileId of profileIds) {
        const profileUrl = `https://memory.twilio.com/v1/Stores/${this.memoryStoreId}/Profiles/${profileId}`;

        const profileResponse = await fetch(profileUrl, {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
            ).toString('base64')}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const profilePhone = profileData.traits?.Contact?.phone || profileData.traits?.phone;

          if (profilePhone && this.normalizePhone(profilePhone) === normalizedPhone) {
            matchingProfileId = profileId;
            console.log(`Found Memory profile ${profileId} for ${phoneNumber}`);
            break;
          }
        }
      }

      if (!matchingProfileId) {
        console.log(`No Memory profile found matching phone ${phoneNumber}`);
        return null;
      }

      // Step 3: Use Recall API to get observations and summaries together
      const recallUrl = `https://memory.twilio.com/v1/Stores/${this.memoryStoreId}/Profiles/${matchingProfileId}/Recall`;

      const recallResponse = await fetch(recallUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          observationsLimit: 20,
          summariesLimit: 10
        })
      });

      if (!recallResponse.ok) {
        console.error(`Memory Recall API error: ${recallResponse.status}`);
        return {
          profileId: matchingProfileId,
          observations: [],
          summaries: []
        };
      }

      const recallData = await recallResponse.json();

      // Transform observations (keep conversationIds for later conversation fetching)
      const observations = (recallData.observations || []).map((obs: any) => ({
        observationId: obs.id,
        content: obs.content,
        timestamp: obs.createdAt || obs.occurredAt,
        conversationIds: obs.conversationIds || []
      }));

      // Transform summaries
      const summaries = (recallData.summaries || []).map((sum: any) => ({
        summaryId: sum.id,
        content: sum.content,
        timestamp: sum.createdAt || sum.updatedAt
      }));

      console.log(`Memory Recall returned ${observations.length} observations, ${summaries.length} summaries`);

      return {
        profileId: matchingProfileId,
        observations,
        summaries
      };
    } catch (error) {
      console.error('Error fetching Memory profile:', error);
      return null;
    }
  }

  /**
   * Get observations for a Memory profile
   */
  async getObservations(profileId: string): Promise<MemoryObservation[]> {
    try {
      if (!this.memoryStoreId) return [];

      const url = `https://memory.twilio.com/v1/Stores/${this.memoryStoreId}/Profiles/${profileId}/Observations`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Memory API error: ${response.status}`);
      }

      const data = await response.json();
      const observations = data.observations || [];

      // Transform to our MemoryObservation format
      return observations.map((obs: any) => ({
        observationId: obs.id,
        content: obs.content,
        timestamp: obs.createdAt || obs.occurredAt
      }));
    } catch (error) {
      console.error('Error fetching observations:', error);
      return [];
    }
  }

  /**
   * Get summaries for a Memory profile
   */
  async getSummaries(profileId: string): Promise<MemorySummary[]> {
    try {
      if (!this.memoryStoreId) return [];

      const url = `https://memory.twilio.com/v1/Stores/${this.memoryStoreId}/Profiles/${profileId}/Summaries`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN
          ).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No summaries found (this is normal if none have been created yet)');
          return [];
        }
        throw new Error(`Memory API error: ${response.status}`);
      }

      const data = await response.json();
      const summaries = data.summaries || [];

      // Transform to our MemorySummary format
      return summaries.map((sum: any) => ({
        summaryId: sum.id,
        content: sum.content,
        timestamp: sum.createdAt || sum.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching summaries:', error);
      return [];
    }
  }

  /**
   * Normalize phone to E.164 format
   */
  private normalizePhone(phone: string): string {
    // Remove any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it doesn't start with +, add country code
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = `+1${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }

    return cleaned;
  }
}
