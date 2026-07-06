# Checking Twilio ConversationRelay Documentation

ConversationRelay is a newer Twilio feature. Let me verify:
1. Is it available for our account?
2. What's the correct TwiML format?
3. Should we use Media Streams instead?

For OpenAI Realtime API, the standard approach is:
- Use <Stream> (Media Streams) to send audio to our WebSocket
- Our server relays between Twilio Media Streams and OpenAI Realtime API

ConversationRelay is different - it's for AI assistants that handle the full conversation.
