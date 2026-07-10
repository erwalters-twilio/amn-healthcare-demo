import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;

async function testMemoryLookup(phone) {
  console.log('Testing Memory API Lookup (v2)...');
  console.log('Phone:', phone);
  console.log('Memory Store ID:', MEMORY_STORE_ID);
  
  // Try using query parameters instead of POST body
  const lookupUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/Lookup?idType=phone_number&value=${encodeURIComponent(phone)}`;
  
  console.log('URL:', lookupUrl);
  
  const response = await fetch(lookupUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
    }
  });
  
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Profile found:', JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.log('Error:', text);
  }
}

testMemoryLookup('+13304027149');
