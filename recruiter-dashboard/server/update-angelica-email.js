import { Analytics } from '@segment/analytics-node';
import dotenv from 'dotenv';
dotenv.config();

const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

// Update Angelica's profile to use her actual email (vamifu@mailinator.com)
// This should free up erwalters@twilio.com as an identifier

analytics.identify({
  userId: 'angelica-lynch-unique-id', // New unique user_id
  traits: {
    email: 'vamifu@mailinator.com',
    firstName: 'Angelica',
    lastName: 'Lynch',
    phone: '+19831685155'
  }
});

console.log('✅ Sent identify call to move Angelica to new identifier');
console.log('   Old identifier: email:erwalters@twilio.com');
console.log('   New identifier: user_id:angelica-lynch-unique-id');
console.log('   This should free up erwalters@twilio.com for Eric Walters');

await analytics.closeAndFlush();
