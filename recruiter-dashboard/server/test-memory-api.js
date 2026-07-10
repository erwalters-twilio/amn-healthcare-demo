import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;

async function testMemoryLookup(phone) {
  console.log('Testing Memory API Lookup...');
  console.log('Phone:', phone);
  console.log('Memory Store ID:', MEMORY_STORE_ID);
  
  const lookupUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/Lookup`;
  
  const response = await fetch(lookupUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      identifier: phone,
      identifier_type: 'phone_number'
    })
  });
  
  console.log('Response status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Profile found:', JSON.stringify(data, null, 2));
    
    if (data.profile_id) {
      console.log('\nFetching observations...');
      const obsUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${data.profile_id}/Observations`;
      const obsRes = await fetch(obsUrl, {
        headers: {
          'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
        }
      });
      
      if (obsRes.ok) {
        const obsData = await obsRes.json();
        console.log('Observations:', JSON.stringify(obsData, null, 2));
      }
    }
  } else {
    const text = await response.text();
    console.log('Error:', text);
  }
}

testMemoryLookup('+13304027149');
