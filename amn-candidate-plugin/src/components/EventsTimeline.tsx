import React, { useState } from 'react';
import { SegmentEvent } from '../types';

interface EventsTimelineProps {
  events: SegmentEvent[];
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

function EventRow({ event }: { event: SegmentEvent }) {
  const [expanded, setExpanded] = useState(false);
  const propKeys = Object.keys(event.properties || {}).filter(k => event.properties[k] != null && event.properties[k] !== '');
  const hasProps = propKeys.length > 0;

  return (
    <div style={styles.row}>
      <div style={styles.dot} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.rowTop}>
          <span style={styles.eventName}>{event.name}</span>
          {event.timestamp && (
            <span style={styles.timestamp}>{formatDate(event.timestamp)}</span>
          )}
        </div>
        {hasProps && (
          <>
            <button style={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
              {expanded ? 'hide details' : `${propKeys.length} propert${propKeys.length === 1 ? 'y' : 'ies'}`}
            </button>
            {expanded && (
              <div style={styles.propsGrid}>
                {propKeys.map(k => (
                  <div key={k} style={styles.propChip}>
                    <div style={styles.propKey}>{k}</div>
                    <div style={styles.propVal}>{String(event.properties[k])}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>📋</span>
        <span style={styles.headerTitle}>Segment Events</span>
        <span style={styles.badge}>{events.length}</span>
      </div>

      {events.length === 0 ? (
        <div style={styles.empty}>No events found</div>
      ) : (
        <div style={styles.body}>
          <div style={styles.timeline}>
            {sorted.map((evt, i) => (
              <EventRow key={`${evt.name}-${evt.timestamp}-${i}`} event={evt} />
            ))}
          </div>
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
  header: {
    background: 'linear-gradient(135deg, #0074A1 0%, #003B5C 100%)',
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
  body: { padding: '12px 20px', maxHeight: 480, overflowY: 'auto' },
  timeline: { position: 'relative', paddingLeft: 16 },
  row: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
    position: 'relative',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#0074A1',
    flexShrink: 0,
    marginTop: 5,
  },
  rowTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  eventName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 500,
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: '#0074A1',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '2px 0',
    textDecoration: 'underline',
  },
  propsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginTop: 6,
  },
  propChip: {
    background: '#f0f7fb',
    borderRadius: 6,
    padding: '6px 10px',
  },
  propKey: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 2,
  },
  propVal: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
    wordBreak: 'break-word' as const,
  },
};
