import dotenv from 'dotenv';
dotenv.config();

const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;

async function testSegmentEvents() {
  const identifier = 'user_id:erwalters@twilio.com';
  const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${encodeURIComponent(identifier)}/events?limit=50`;
  
  console.log('Fetching events from:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${Buffer.from(SEGMENT_PROFILE_TOKEN + ':').toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    console.log('Error:', await response.text());
    return;
  }
  
  const data = await response.json();
  console.log('Events response:', JSON.stringify(data, null, 2));
}

testSegmentEvents();
