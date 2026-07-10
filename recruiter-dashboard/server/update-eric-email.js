import { Analytics } from '@segment/analytics-node';
import dotenv from 'dotenv';
dotenv.config();

const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });

// Identify Eric Walters with email as the primary identifier
analytics.identify({
  userId: 'erwalters@twilio.com',
  traits: {
    email: 'erwalters@twilio.com',
    firstName: 'Eric',
    lastName: 'Walters',
    phone: '+13304027149',
    profession: 'Physician',
    specialty: 'ICU',
    otherSpecialty: 'Pediatrics',
    city: 'Rocky River',
    state: 'California'
  }
});

console.log('✅ Sent identify call for Eric Walters');
console.log('   Identifier: user_id:erwalters@twilio.com');
console.log('   Email trait: erwalters@twilio.com');
console.log('   This creates/updates the profile with email as the user_id');

await analytics.closeAndFlush();
