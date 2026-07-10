/**
 * Segment Destination Function - AMN Recruiter Dashboard
 *
 * Automatically updates the recruiter dashboard when a call is transferred.
 * Listens for "Call Transferred to Recruiter" events and forwards them to
 * the dashboard webhook API.
 *
 * @param {SegmentTrackEvent} event - The Segment track event
 * @param {Object} settings - Function settings (webhookUrl)
 */
async function onTrack(event, settings) {
  // Only process "Call Transferred to Recruiter" events
  if (event.event !== 'Call Transferred to Recruiter') {
    console.log(`Ignoring event: ${event.event}`);
    return;
  }

  const webhookUrl = settings.webhookUrl;
  if (!webhookUrl) {
    throw new Error('Webhook URL is not configured in settings');
  }

  // Extract phone number from event
  // Priority: properties.phone > anonymousId > userId
  const phone = event.properties?.phone || event.anonymousId || event.userId;

  if (!phone) {
    throw new Error('No phone number found in event. Must provide anonymousId or properties.phone');
  }

  console.log(`Processing call transfer for phone: ${phone}`);

  // Prepare webhook payload
  const payload = {
    userId: event.userId,
    anonymousId: event.anonymousId,
    event: event.event,
    properties: {
      ...event.properties,
      phone: phone,
      timestamp: event.timestamp,
      messageId: event.messageId
    },
    context: {
      source: 'segment-destination-function'
    }
  };

  // Send to webhook
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Segment-Destination-Function/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Webhook success:', result);

    return result;
  } catch (error) {
    console.error('Error calling webhook:', error);
    throw error;
  }
}

/**
 * Settings configuration for the destination function
 */
const settings = {
  webhookUrl: {
    label: 'Webhook URL',
    description: 'Your Vercel deployment URL + /webhooks/segment (e.g., https://your-app.vercel.app/webhooks/segment)',
    type: 'string',
    required: true
  }
};

module.exports = {
  onTrack,
  settings
};
