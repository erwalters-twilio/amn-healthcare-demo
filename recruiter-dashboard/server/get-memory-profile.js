import dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MEMORY_STORE_ID = process.env.MEMORY_STORE_ID;
const PROFILE_ID = 'mem_profile_01kwwhqgy7fhyv517zmf53p7bb';

async function getProfile() {
  console.log('Getting Memory Profile...');
  
  // Get profile details
  const profileUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${PROFILE_ID}`;
  const profileRes = await fetch(profileUrl, {
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
    }
  });
  
  console.log('Profile status:', profileRes.status);
  if (profileRes.ok) {
    const profile = await profileRes.json();
    console.log('Profile:', JSON.stringify(profile, null, 2));
  }
  
  // Get observations
  const obsUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${PROFILE_ID}/Observations`;
  const obsRes = await fetch(obsUrl, {
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
    }
  });
  
  console.log('\nObservations status:', obsRes.status);
  if (obsRes.ok) {
    const obs = await obsRes.json();
    console.log('Observations:', JSON.stringify(obs, null, 2));
  }
  
  // Get summaries
  const sumUrl = `https://memory.twilio.com/v1/Stores/${MEMORY_STORE_ID}/Profiles/${PROFILE_ID}/Summaries`;
  const sumRes = await fetch(sumUrl, {
    headers: {
      'Authorization': `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`
    }
  });
  
  console.log('\nSummaries status:', sumRes.status);
  if (sumRes.ok) {
    const sum = await sumRes.json();
    console.log('Summaries:', JSON.stringify(sum, null, 2));
  }
}

getProfile();
