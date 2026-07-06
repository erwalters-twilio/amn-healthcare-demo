import { Analytics } from '@segment/analytics-node';

export default async function handler(req, res) {
  const writeKey = process.env.SEGMENT_WRITE_KEY;

  console.log('Write key present:', !!writeKey);
  console.log('Write key prefix:', writeKey ? writeKey.substring(0, 8) : 'NONE');

  try {
    const analytics = new Analytics({
      writeKey: writeKey,
      flushAt: 1,
    });

    // Track a test event
    await analytics.track({
      anonymousId: '+15555555555',
      event: 'Test Event from API',
      properties: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('Event queued, about to flush...');

    // Flush to send immediately
    await analytics.flush();

    console.log('Event flushed successfully!');

    return res.status(200).json({
      success: true,
      message: 'Event sent to Segment',
      writeKeyPrefix: writeKey ? writeKey.substring(0, 8) : 'NONE',
    });
  } catch (error) {
    console.error('Error sending to Segment:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
