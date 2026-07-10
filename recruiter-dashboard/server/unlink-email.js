import dotenv from 'dotenv';
dotenv.config();

const SEGMENT_PROFILE_TOKEN = process.env.SEGMENT_PROFILE_TOKEN;
const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;

async function unlinkExternalId(segmentId, idType, idValue) {
  // Segment Profile API: DELETE external_id removes the mapping
  const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/segment_id:${segmentId}/external_ids/${idType}:${idValue}`;
  
  console.log('Unlinking external ID:');
  console.log('  Segment ID:', segmentId);
  console.log('  ID Type:', idType);
  console.log('  ID Value:', idValue);
  console.log('  URL:', url);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${Buffer.from(SEGMENT_PROFILE_TOKEN + ':').toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Response status:', response.status);
  
  if (response.status === 204 || response.status === 200) {
    console.log('✅ External ID unlinked successfully!');
    console.log('   The email "erwalters@twilio.com" is now available for use.');
    return true;
  } else {
    const text = await response.text();
    console.log('Response:', text);
    return false;
  }
}

// Unlink email:erwalters@twilio.com from Angelica Lynch's profile
unlinkExternalId('use_EEi7HhNa0XdU5WCNggL3FzTI4dU', 'email', 'erwalters@twilio.com');
