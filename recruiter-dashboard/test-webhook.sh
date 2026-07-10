#!/bin/bash

echo "🧪 Testing AMN Recruiter Dashboard Webhook"
echo "=========================================="
echo ""

echo "Simulating 'Call Transferred to Recruiter' event..."
echo ""

curl -X POST http://localhost:3001/webhooks/segment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "phone:+13304027149",
    "event": "Call Transferred to Recruiter",
    "properties": {
      "phone": "+13304027149",
      "call_sid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "from": "+13304027149"
    }
  }'

echo ""
echo ""
echo "✅ Webhook processed!"
echo ""
echo "Now open the dashboard at: http://localhost:5174"
echo "The candidate should auto-load!"
