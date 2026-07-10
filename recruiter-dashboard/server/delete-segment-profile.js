import dotenv from 'dotenv';
dotenv.config();

const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;

async function deleteProfile(identifier) {
  const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/${encodeURIComponent(identifier)}`;
  
  console.log('Deleting profile:', identifier);
  console.log('URL:', url);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${Buffer.from(SEGMENT_PROFILE_TOKEN + ':').toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Response status:', response.status);
  
  if (response.status === 204 || response.status === 200) {
    console.log('✅ Profile deleted successfully!');
    return true;
  } else if (response.status === 404) {
    console.log('⚠️  Profile not found (may already be deleted)');
    return false;
  } else {
    const text = await response.text();
    console.log('❌ Error:', response.status, text);
    return false;
  }
}

// Delete Angelica Lynch profile with email:erwalters@twilio.com identifier
deleteProfile('email:erwalters@twilio.com');
