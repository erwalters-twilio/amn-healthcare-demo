import { useState, useEffect, useRef } from 'react';
import { getAnalytics, USER_IDENTITY_KEY } from '../utils/analytics';
import './ChatWidget.css';

const STORAGE_KEY = 'amn_chat_conversation_sid';
const IDENTITY_KEY = USER_IDENTITY_KEY;

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationSid, setConversationSid] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize or restore conversation when chat opens
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return; // already initialized

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConversationSid(stored);
      setMessages([{
        role: 'assistant',
        text: "Welcome back! I'm here to help you find your next healthcare role. What can I help you with today?",
      }]);
    } else {
      createConversation();
    }
  }, [isOpen]);

  async function createConversation() {
    try {
      const res = await fetch('/api/chat-inbound?action=create', { method: 'POST' });
      const data = await res.json();
      if (data.conversationSid) {
        localStorage.setItem(STORAGE_KEY, data.conversationSid);
        setConversationSid(data.conversationSid);
        const analytics = getAnalytics();
        if (analytics) {
          analytics.track('Chat Session Started', {
            channel: 'web_chat',
            conversation_sid: data.conversationSid,
          });
        }
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
    setMessages([{
      role: 'assistant',
      text: "Hi! I'm here to help you find your next healthcare role. What are you looking for?",
    }]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userIdentity = localStorage.getItem(IDENTITY_KEY) || undefined;
      const res = await fetch('/api/chat-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationSid: conversationSid || localStorage.getItem(STORAGE_KEY),
          message: text,
          userIdentity,
          messageHistory: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      }

      // Fire Segment track for any extracted preferences (server-side handles the identify)
      if (data.extractedPreferences && Object.keys(data.extractedPreferences).length > 0) {
        const analytics = getAnalytics();
        if (analytics) {
          analytics.track('Chat Preference Captured', {
            channel: 'web_chat',
            fields_captured: Object.keys(data.extractedPreferences),
            conversation_sid: conversationSid,
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function resetChat() {
    localStorage.removeItem(STORAGE_KEY);
    setConversationSid(null);
    setMessages([]);
    createConversation();
  }

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">AMN</div>
              <div>
                <div className="chat-title">AMN Healthcare Assistant</div>
                <div className="chat-subtitle">Find your next role</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-reset-btn" onClick={resetChat} title="Start new conversation">↺</button>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message chat-message--${msg.role}`}>
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message--assistant">
                <div className="chat-bubble chat-bubble--typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        className={`chat-fab ${isOpen ? 'chat-fab--open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}

export default ChatWidget;
