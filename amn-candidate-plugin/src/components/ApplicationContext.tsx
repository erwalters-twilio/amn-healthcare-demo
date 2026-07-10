import React from 'react';

interface ApplicationContextProps {
  applicationContext: {
    job_applied?: string;
    application_id?: string;
    abandonment_step?: string;
  };
}

export function ApplicationContext({ applicationContext }: ApplicationContextProps) {
  const { job_applied, application_id, abandonment_step } = applicationContext;
  if (!job_applied && !application_id && !abandonment_step) return null;

  const hasAbandonment = !!abandonment_step;

  return (
    <div style={styles.card}>
      <div style={{
        ...styles.header,
        background: hasAbandonment
          ? 'linear-gradient(135deg, #d97706 0%, #92400e 100%)'
          : 'linear-gradient(135deg, #00A651 0%, #007a3d 100%)',
      }}>
        <span style={styles.headerIcon}>{hasAbandonment ? '⚠️' : '✅'}</span>
        <span style={styles.headerTitle}>Application Status</span>
        <span style={styles.badge}>{hasAbandonment ? 'Abandoned' : 'Active'}</span>
      </div>

      <div style={styles.body}>
        {job_applied && (
          <div style={styles.item}>
            <div style={styles.itemLabel}>Position Applied</div>
            <div style={styles.itemValue}>{job_applied}</div>
          </div>
        )}
        {application_id && (
          <div style={styles.item}>
            <div style={styles.itemLabel}>Application ID</div>
            <div style={{ ...styles.itemValue, fontFamily: 'monospace', fontSize: 12 }}>
              {application_id}
            </div>
          </div>
        )}
        {abandonment_step && (
          <div style={styles.abandonItem}>
            <div style={styles.abandonLabel}>Abandoned At</div>
            <div style={styles.abandonValue}>{abandonment_step}</div>
          </div>
        )}
      </div>
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
  body: { padding: '16px 20px' },
  item: {
    background: '#f9fafb',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
  },
  abandonItem: {
    background: '#fffbeb',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '0 8px 8px 0',
    padding: '10px 14px',
  },
  abandonLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#92400e',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 4,
  },
  abandonValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#78350f',
  },
};
