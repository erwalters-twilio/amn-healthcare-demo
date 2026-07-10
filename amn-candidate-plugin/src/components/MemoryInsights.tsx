import React from 'react';
import { MemoryProfile } from '../types';

interface MemoryInsightsProps {
  memoryProfile: MemoryProfile | null;
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export function MemoryInsights({ memoryProfile }: MemoryInsightsProps) {
  const isEmpty = !memoryProfile ||
    (!memoryProfile.observations?.length && !memoryProfile.summaries?.length);

  return (
    <div style={styles.card}>
      <div style={styles.headerPurple}>
        <span style={styles.headerIcon}>🧠</span>
        <span style={styles.headerTitle}>AI Insights</span>
        {!isEmpty && (
          <span style={styles.badge}>
            {(memoryProfile!.observations?.length || 0) + (memoryProfile!.summaries?.length || 0)} items
          </span>
        )}
      </div>

      {isEmpty ? (
        <div style={styles.empty}>No insights available yet</div>
      ) : (
        <div style={styles.body}>
          {/* Key Facts */}
          {memoryProfile!.observations && memoryProfile!.observations.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>✓ Key Facts ({memoryProfile!.observations.length})</div>
              {memoryProfile!.observations.map((obs, i) => (
                <div key={obs.observationId || i} style={styles.observationCard}>
                  {obs.content}
                </div>
              ))}
            </div>
          )}

          {/* Summaries */}
          {memoryProfile!.summaries && memoryProfile!.summaries.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>✦ Conversation Summaries ({memoryProfile!.summaries.length})</div>
              {memoryProfile!.summaries.map((sum, i) => (
                <div key={sum.summaryId || i} style={styles.summaryCard}>
                  <div style={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>{sum.content}</div>
                  {sum.timestamp && (
                    <div style={styles.timestamp}>{formatDate(sum.timestamp)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
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
  headerPurple: {
    background: 'linear-gradient(135deg, #003B5C 0%, #002840 100%)',
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
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 10,
  },
  observationCard: {
    background: '#fffbeb',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '0 8px 8px 0',
    padding: '10px 14px',
    fontSize: 13,
    color: '#1f2937',
    fontWeight: 500,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  summaryCard: {
    background: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '0 8px 8px 0',
    padding: '12px 14px',
    fontSize: 13,
    color: '#1f2937',
    fontWeight: 500,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 600,
    marginTop: 8,
  },
};
