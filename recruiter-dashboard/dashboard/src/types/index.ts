export interface SegmentProfile {
  traits: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    profession?: string;
    specialty?: string;
    discipline?: string;
    city?: string;
    zipCode?: string;
    job_applied?: string;
    application_id?: string;
    abandonment_step?: string;
    [key: string]: any;
  };
}

export interface SegmentEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface TwilioMessage {
  sid: string;
  author: string;
  body: string;
  dateCreated: Date | string;
  attributes: string;
}

export interface TwilioConversation {
  sid: string;
  friendlyName?: string;
  attributes: Record<string, any>;
  messages: TwilioMessage[];
}

export interface MemoryObservation {
  observationId: string;
  content: string;
  timestamp: string;
}

export interface MemorySummary {
  summaryId: string;
  content: string;
  timestamp: string;
}

export interface MemoryProfile {
  profileId: string;
  observations: MemoryObservation[];
  summaries: MemorySummary[];
}

export interface CandidateData {
  identifier: string;
  profile: SegmentProfile;
  events: SegmentEvent[];
  conversations: TwilioConversation[];
  memoryProfile: MemoryProfile | null;
  applicationContext: {
    job_applied?: string;
    application_id?: string;
    abandonment_step?: string;
  };
  lastUpdated: string;
}

export interface CandidateSearchResult {
  identifier: string;
  name: string;
  email?: string;
  phone?: string;
  profession?: string;
  lastActivity?: string;
}
