// Candidate data API for Flex plugin
// Fetches Segment profile, Twilio Memory, and Conversations by phone number
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
  const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;

  const segmentAuth = `Basic ${Buffer.from(`${SEGMENT_PROFILE_TOKEN}:`).toString('base64')}`;
  const twilioAuth = `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`;
  const segmentBase = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles`;

  // Try anonymous_id (primary), then phone: fallback
  async function fetchSegmentProfile(identifier) {
    const url = `${segmentBase}/${encodeURIComponent(identifier)}/traits`;
    const r = await fetch(url, { headers: { Authorization: segmentAuth } });
    if (!r.ok) return null;
    const d = await r.json();
    return { traits: d.traits || {} };
  }

  async function fetchSegmentEvents(identifier) {
    const url = `${segmentBase}/${encodeURIComponent(identifier)}/events?limit=50`;
    const r = await fetch(url, { headers: { Authorization: segmentAuth } });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.data || d.events || []).map(e => ({
      name: e.event, properties: e.properties || {}, timestamp: e.timestamp
    }));
  }

  async function fetchMemoryProfile(normalizedPhone) {
    if (!MEMORY_STORE_ID) return null;
    // List profiles
    const listR = await fetch(`https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles`, {
      headers: { Authorization: twilioAuth }
    });
    if (!listR.ok) return null;
    const { profiles = [] } = await listR.json();

    for (const profileId of profiles) {
      const pR = await fetch(`https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${profileId}`, {
        headers: { Authorization: twilioAuth }
      });
      if (!pR.ok) continue;
      const pData = await pR.json();
      const profilePhone = pData.traits?.Contact?.phone || pData.traits?.phone || '';
      if (normalizePhone(profilePhone) === normalizedPhone) {
        // Found match — use Recall API
        const recallR = await fetch(
          `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${profileId}/Recall`,
          {
            method: 'POST',
            headers: { Authorization: twilioAuth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ observationsLimit: 20, summariesLimit: 10 })
          }
        );
        if (!recallR.ok) return { profileId, observations: [], summaries: [] };
        const rd = await recallR.json();
        return {
          profileId,
          observations: (rd.observations || []).map(o => ({
            observationId: o.id, content: o.content,
            timestamp: o.createdAt || o.occurredAt,
            conversationIds: o.conversationIds || []
          })),
          summaries: (rd.summaries || []).map(s => ({
            summaryId: s.id, content: s.content,
            timestamp: s.createdAt || s.updatedAt
          }))
        };
      }
    }
    return null;
  }

  async function fetchConversationsByPhone(normalizedPhone) {
    const url = `https://conversations.twilio.com/v1/ParticipantConversations?Address=${encodeURIComponent(normalizedPhone)}&PageSize=50`;
    const r = await fetch(url, { headers: { Authorization: twilioAuth } });
    if (!r.ok) return [];
    const d = await r.json();
    const participantConvs = d.conversations || [];

    const convs = [];
    for (const pc of participantConvs) {
      try {
        const [convR, msgsR] = await Promise.all([
          fetch(`https://conversations.twilio.com/v1/Conversations/${pc.conversation_sid}`, { headers: { Authorization: twilioAuth } }),
          fetch(`https://conversations.twilio.com/v1/Conversations/${pc.conversation_sid}/Messages?PageSize=100&Order=asc`, { headers: { Authorization: twilioAuth } })
        ]);
        if (!convR.ok) continue;
        const convData = await convR.json();
        const msgsData = msgsR.ok ? await msgsR.json() : { messages: [] };
        convs.push({
          sid: convData.sid,
          friendlyName: convData.friendly_name || `Conversation ${convData.sid.slice(-8)}`,
          attributes: convData.attributes ? JSON.parse(convData.attributes) : {},
          messages: (msgsData.messages || []).map(m => ({
            sid: m.sid, author: m.author || 'unknown',
            body: m.body || '', dateCreated: m.date_created,
            attributes: m.attributes || '{}'
          }))
        });
      } catch (_) {}
    }
    return convs;
  }

  async function fetchConversationsByIds(ids) {
    const convs = [];
    for (const id of ids) {
      const r = await fetch(`https://intelligence.twilio.com/v3/Conversations/${id}`, {
        headers: { Authorization: twilioAuth }
      });
      if (!r.ok) continue;
      const d = await r.json();
      const messages = (d.communications || []).map(c => {
        const p = (d.participants || []).find(x => x.id === c.participantId);
        return { sid: c.id, author: p?.name || p?.type || 'unknown', body: c.content?.text || '', dateCreated: c.createdAt };
      }).filter(m => m.body);
      convs.push({
        sid: id,
        friendlyName: d.name || `Conversation ${id.slice(-8)}`,
        attributes: { status: d.status, channels: d.channels },
        messages
      });
    }
    return convs;
  }

  function normalizePhone(p) {
    let cleaned = p.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`;
    }
    return cleaned;
  }

  try {
    const normalizedPhone = normalizePhone(phone);

    // Fetch Segment profile — try anonymous_id first (how phone tracking works), then phone:
    let profile = await fetchSegmentProfile(`anonymous_id:${normalizedPhone}`);
    if (!profile) profile = await fetchSegmentProfile(`phone:${normalizedPhone}`);

    const events = profile
      ? await fetchSegmentEvents(`anonymous_id:${normalizedPhone}`)
      : [];

    // Fetch Memory and Conversations in parallel
    const [memoryProfile, convsByPhone] = await Promise.all([
      fetchMemoryProfile(normalizedPhone),
      fetchConversationsByPhone(normalizedPhone)
    ]);

    // If Memory has conversation IDs, prefer those; otherwise use phone-based lookup
    let conversations = convsByPhone;
    if (memoryProfile?.observations?.length > 0) {
      const ids = [...new Set(memoryProfile.observations.flatMap(o => o.conversationIds || []))];
      if (ids.length > 0) {
        const convsByIds = await fetchConversationsByIds(ids);
        if (convsByIds.length > 0) conversations = convsByIds;
      }
    }

    res.status(200).json({
      identifier: normalizedPhone,
      profile: profile || { traits: {} },
      events,
      conversations,
      memoryProfile,
      applicationContext: {
        job_applied: profile?.traits?.job_applied,
        application_id: profile?.traits?.application_id,
        abandonment_step: profile?.traits?.abandonment_step
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Candidate API error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate data', message: error.message });
  }
}
