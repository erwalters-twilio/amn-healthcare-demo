// Test file to verify Vercel logs
export default async function handler(req, res) {
  console.log('TEST LOG 1 - Function started');
  console.error('TEST ERROR LOG');
  console.warn('TEST WARN LOG');
  
  res.status(200).json({ 
    message: 'Test endpoint',
    timestamp: new Date().toISOString()
  });
  
  console.log('TEST LOG 2 - After response');
}
