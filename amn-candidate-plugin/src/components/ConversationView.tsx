import React from 'react';
import { TwilioConversation } from '../types';

interface ConversationViewProps {
  conversations: TwilioConversation[];
}

function isAIAgent(author: string) {
  const lower = author.toLowerCase();
  return lower.includes('ai') || lower.includes('agent') || lower === 'system';
}

function formatDate(d: Date | string) {
  try {
    return new Date(d).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return String(d);
  }
}

export function ConversationView({ conversations }: ConversationViewProps) {
  const totalMessages = conversations.reduce((s, c) => s + c.messages.length, 0);

  return (
    <div style={styles.card}>
      <div style={styles.headerGreen}>
        <span style={styles.headerIcon}>💬</span>
        <span style={styles.headerTitle}>Conversation History</span>
        <span style={styles.badge}>{totalMessages} messages</span>
      </div>

      {conversations.length === 0 ? (
        <div style={styles.empty}>No conversation history</div>
      ) : (
        <div style={styles.body}>
          {conversations.map((conv) => (
            <div key={conv.sid} style={{ marginBottom: 20 }}>
              {conv.friendlyName && (
                <div style={styles.convLabel}>{conv.friendlyName}</div>
              )}
              {conv.messages.map((msg) => {
                const isAI = isAIAgent(msg.author);
                return (
                  <div key={msg.sid} style={{
                    ...styles.msgRow,
                    flexDirection: isAI ? 'row' : 'row-reverse',
                  }}>
                    <div style={{
                      ...styles.avatar,
                      background: isAI ? '#dbeafe' : '#dcfce7',
                    }}>
                      {isAI ? '🤖' : '👤'}
                    </div>
                    <div style={{ maxWidth: '82%' }}>
                      <div style={{
                        ...styles.bubble,
                        background: isAI ? '#f1f5f9' : 'linear-gradient(135deg, #0074A1, #003B5C)',
                        color: isAI ? '#1f2937' : '#fff',
                        borderRadius: isAI ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      }}>
                        {msg.body}
                      </div>
                      <div style={{
                        ...styles.msgTime,
                        textAlign: isAI ? 'left' : 'right',
                      }}>
                        {formatDate(msg.dateCreated)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  headerGreen: {
    background: 'linear-gradient(135deg, #00A651 0%, #007a3d 100%)',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#fff', flex: 1 },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 8,
  },
  empty: {
    padding: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
  body: { padding: '16px 20px', maxHeight: 500, overflowY: 'auto' },
  convLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 10,
  },
  msgRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  bubble: {
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 500,
    whiteSpace: 'pre-wrap',
  },
  msgTime: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 600,
    marginTop: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
};
