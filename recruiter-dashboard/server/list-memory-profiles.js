import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;

async function listProfiles() {
  console.log('Listing Memory Store Profiles...');
  console.log('Memory Store ID:', MEMORY_STORE_ID);
  
  const url = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles`;
  
  console.log('URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
    }
  });
  
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Profiles:', JSON.stringify(data, null, 2));
  } else {
    const text = await response.text();
    console.log('Error:', text);
  }
}

listProfiles();
