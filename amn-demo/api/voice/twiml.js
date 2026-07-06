/**
 * TwiML Endpoint for ConversationRelay
 *
 * This endpoint is called by Twilio when initiating a voice call.
 * It returns TwiML that connects the call to AI via ConversationRelay.
 *
 * Called by: Segment Journey → Twilio Voice API → This endpoint
 *
 * Query Parameters:
 * - phone: Candidate's phone number (for Segment profile lookup)
 */

export default async function handler(req, res) {
  try {
    // Get phone number from query params (passed by Segment Journey)
    const { phone } = req.query;

    if (!phone) {
      console.error('Missing phone number parameter');
      return res.status(400).json({ error: 'Phone number required' });
    }

    console.log('Generating TwiML for ConversationRelay:', { phone });

    // WebSocket URL for ConversationRelay server
    const AI_WEBSOCKET_URL = process.env.AI_WEBSOCKET_URL;

    if (!AI_WEBSOCKET_URL) {
      throw new Error('AI_WEBSOCKET_URL environment variable not set');
    }

    // Generate TwiML with ConversationRelay
    // Note: Remove wss:// prefix - Twilio adds it automatically
    const wsUrl = AI_WEBSOCKET_URL.replace('wss://', '').replace('ws://', '');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="wss://${wsUrl}"
      dtmfDetection="true">
      <Parameter name="phone" value="${phone}" />
      <Parameter name="source" value="rcs_reply" />
      <Parameter name="timestamp" value="${new Date().toISOString()}" />
    </ConversationRelay>
  </Connect>
</Response>`;

    console.log('TwiML generated successfully');

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml);
  } catch (error) {
    console.error('Error generating TwiML:', error);

    // Return error TwiML that hangs up gracefully
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    We're sorry, but we're unable to connect your call at this time. Please try again later.
  </Say>
  <Hangup/>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(errorTwiml);
  }
}
