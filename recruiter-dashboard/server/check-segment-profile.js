import dotenv from 'dotenv';
dotenv.config();

const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;

async function checkProfile(identifier) {
  const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${encodeURIComponent(identifier)}/metadata`;
  
  console.log('Checking profile metadata:', identifier);
  console.log('URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(SEGMENT_PROFILE_TOKEN + ':').toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Metadata:', JSON.stringify(data, null, 2));
  } else {
    console.log('Error:', await response.text());
  }
}

checkProfile('email:erwalters@twilio.com');
