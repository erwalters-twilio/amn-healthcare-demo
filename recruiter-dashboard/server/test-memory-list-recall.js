import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;
const PROFILE_ID = 'mem_profile_01kwwhqgy7fhyv517zmf53p7bb';

async function testRecall() {
  console.log('Testing Recall API...');
  
  const url = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${PROFILE_ID}/Recall`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      observationsLimit: 20,
      summariesLimit: 10
    })
  });
  
  console.log('Status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log(`Observations: ${data.observations?.length || 0}`);
    console.log(`Summaries: ${data.summaries?.length || 0}`);
    
    if (data.summaries && data.summaries.length > 0) {
      console.log('\n📄 Summaries found:');
      data.summaries.forEach((s, i) => {
        console.log(`${i + 1}. ${s.content}`);
      });
    }
  } else {
    console.log('Error:', await response.text());
  }
}

testRecall();
