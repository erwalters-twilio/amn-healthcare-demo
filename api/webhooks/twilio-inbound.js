import twilio from 'twilio';
import { Analytics } from '@segment/analytics-node';

const { validateRequest } = twilio;

// Initialize Segment analytics with server-side write key
const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY,
  flushAt: 1, // Send immediately for real-time tracking
});

// Normalize phone number to E.164 format (e.g., "+13304027149")
// Reuses logic from client-side analytics.js
function normalizePhoneNumber(phone) {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Add +1 country code if not present (assuming US numbers)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Return as-is with + prefix if already formatted
  return `+${digits}`;
}

// Generate timestamp data in consistent format
function getTimestampData() {
  const now = new Date();
  return {
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0],
    unix: Math.floor(now.getTime() / 1000),
  };
}

// Detect RCS interaction type from webhook payload
function detectInteractionType(webhookData) {
  // Button click (RCS rich card)
  if (webhookData.ButtonPayload || webhookData.ButtonText) {
    return {
      type: 'button_click',
      payload: webhookData.ButtonPayload || null,
      text: webhookData.ButtonText || null,
    };
  }

  // List selection (RCS rich card)
  if (webhookData.ListItemId || webhookData.ListItemTitle) {
    return {
      type: 'list_selection',
      itemId: webhookData.ListItemId || null,
      text: webhookData.ListItemTitle || null,
    };
  }

  // Location share
  if (webhookData.Latitude && webhookData.Longitude) {
    return {
      type: 'location_share',
      lat: parseFloat(webhookData.Latitude),
      lon: parseFloat(webhookData.Longitude),
    };
  }

  // Standard text reply
  return {
    type: 'text_reply',
    body: webhookData.Body || '',
  };
}

// Track standard inbound RCS message
async function trackRcsMessageReceived(data) {
  const timestampData = getTimestampData();

  try {
    analytics.track({
      anonymousId: data.from,
      event: 'RCS Message Received',
      properties: {
        message_sid: data.messageSid,
        from: data.from,
        to: data.to,
        body: data.body,
        phone: data.from,
        num_media: data.numMedia,
        channel: 'rcs',
        conversation_sid: data.conversationSid || null,
        ...timestampData,
      },
      timestamp: new Date(),
    });

    console.log('Segment event sent: RCS Message Received', {
      anonymousId: data.from,
      messageSid: data.messageSid,
    });
  } catch (error) {
    console.error('Failed to track RCS message:', error);
  }
}

// Track RCS rich card interaction (button click, list selection, etc.)
async function trackRcsCardInteraction(data) {
  const timestampData = getTimestampData();

  try {
    analytics.track({
      anonymousId: data.from,
      event: 'RCS Card Interaction',
      properties: {
        message_sid: data.messageSid,
        from: data.from,
        to: data.to,
        phone: data.from,
        interaction_type: data.interactionType.type,
        button_payload: data.interactionType.payload,
        button_text: data.interactionType.text,
        list_item_id: data.interactionType.itemId,
        latitude: data.interactionType.lat,
        longitude: data.interactionType.lon,
        channel: 'rcs',
        ...timestampData,
      },
      timestamp: new Date(),
    });

    console.log('Segment event sent: RCS Card Interaction', {
      anonymousId: data.from,
      messageSid: data.messageSid,
      interactionType: data.interactionType.type,
    });
  } catch (error) {
    console.error('Failed to track RCS card interaction:', error);
  }
}

// Main webhook handler
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Validate Twilio signature for security
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = `https://${req.headers.host}${req.url}`;

    const isValid = validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      req.body
    );

    if (!isValid) {
      console.error('Invalid Twilio signature', { url });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // 2. Parse Twilio webhook data
    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia,
      ButtonPayload,
      ButtonText,
      ListItemId,
      ListItemTitle,
      Latitude,
      Longitude,
      MessagingServiceSid,
      ConversationSid,
    } = req.body;

    console.log('Twilio webhook received:', {
      MessageSid,
      From,
      To,
      hasButtonPayload: !!ButtonPayload,
      hasListItem: !!ListItemId,
      timestamp: new Date().toISOString(),
    });

    // 3. Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneNumber(From);
    const normalizedTo = normalizePhoneNumber(To);

    if (!normalizedPhone) {
      console.error('Missing or invalid From phone number');
      return res.status(400).json({ error: 'Missing From number' });
    }

    // 4. Detect interaction type
    const interactionType = detectInteractionType(req.body);

    // 5. Track appropriate event in Segment
    const eventData = {
      messageSid: MessageSid,
      from: normalizedPhone,
      to: normalizedTo,
      body: Body || '',
      numMedia: parseInt(NumMedia || '0', 10),
      conversationSid: ConversationSid || null,
      interactionType,
    };

    if (interactionType.type === 'text_reply') {
      // Standard inbound message
      await trackRcsMessageReceived(eventData);
    } else {
      // Rich card interaction (button, list, location)
      await trackRcsCardInteraction(eventData);
    }

    // 6. Return empty TwiML response (no auto-reply)
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error('Webhook error:', error);

    // Return 200 even on error to prevent Twilio retries
    // (Log the error for debugging but don't break the delivery chain)
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
}
