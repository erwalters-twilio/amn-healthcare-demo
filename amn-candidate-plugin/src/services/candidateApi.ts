import { CandidateData } from '../types';

// FLEX_APP_* env vars are baked in at build time by @twilio/flex-plugin-scripts
declare const process: { env: Record<string, string | undefined> };
const API_BASE = process.env.FLEX_APP_CANDIDATE_API_URL || '';

export async function fetchCandidateData(phone: string): Promise<CandidateData> {
  if (!API_BASE) {
    throw new Error('FLEX_APP_CANDIDATE_API_URL is not set');
  }
  const url = `${API_BASE}/api/candidates/${encodeURIComponent(phone)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Candidate API returned ${response.status}`);
  }
  return response.json();
}
