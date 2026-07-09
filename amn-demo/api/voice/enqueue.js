// Returns TwiML that enqueues the call into Flex via TaskRouter
export default function handler(req, res) {
  const phone = req.query.phone || '';
  const workflowSid = process.env.FLEX_WORKFLOW_SID;

  if (!workflowSid) {
    res.status(500).send('FLEX_WORKFLOW_SID not configured');
    return;
  }

  const attrs = JSON.stringify({ phone, type: 'recruiter_transfer', channel: 'voice' });

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Enqueue workflowSid="${workflowSid}">
    <TaskAttributes>${attrs}</TaskAttributes>
  </Enqueue>
</Response>`);
}
