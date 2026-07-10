import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;

async function testLookup() {
  console.log('Testing Memory Lookup with /Services/ endpoint');
  console.log('Memory Store ID:', MEMORY_STORE_ID);
  
  const url = `https://memory.twilio.com/v1/Services/${MEMORY_STORE_ID}/Profiles/Lookup`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idType: 'phone',
      value: '+13304027149'
    })
  });
  
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
}

testLookup();
