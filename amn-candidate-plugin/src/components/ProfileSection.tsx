import React, { useState } from 'react';
import { SegmentProfile } from '../types';

interface ProfileSectionProps {
  profile: SegmentProfile;
}

const SEGMENT_WRITE_KEY = 'JFvPd0OsxWNOnOaTRqrNBlYBTnn6Xnyp';

export function ProfileSection({ profile }: ProfileSectionProps) {
  const { traits } = profile;
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleCompletePlacement = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch('https://api.segment.io/v1/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${SEGMENT_WRITE_KEY}:`),
        },
        body: JSON.stringify({
          anonymousId: traits.phone || 'unknown',
          event: 'Complete Placement',
          properties: {
            role: traits.profession || traits.specialty,
            specialty: traits.specialty,
            location: traits.city,
            state: traits.state,
            candidateName: `${traits.firstName || ''} ${traits.lastName || ''}`.trim(),
          },
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setCompleted(true);
        setTimeout(() => setCompleted(false), 3000);
      }
    } catch (e) {
      console.error('Placement event failed:', e);
    } finally {
      setIsCompleting(false);
    }
  };

  const statItems = [
    traits.specialty && { label: 'Specialty', value: traits.specialty },
    traits.yearsOfExperience && { label: 'Experience', value: `${traits.yearsOfExperience} yrs` },
    traits.city && { label: 'Location', value: traits.city },
    traits.licenseState && { label: 'License State', value: traits.licenseState },
  ].filter(Boolean) as { label: string; value: string }[];

  const detailItems = [
    traits.discipline && { label: 'Discipline', value: traits.discipline },
    traits.dateOfBirth && { label: 'Date of Birth', value: traits.dateOfBirth },
    traits.shiftPreference && { label: 'Shift Preference', value: traits.shiftPreference },
    traits.availableStartDate && { label: 'Available Start', value: traits.availableStartDate },
    traits.otherSpecialty && { label: 'Other Specialty', value: traits.otherSpecialty },
    traits.licenseNumber && { label: 'License #', value: traits.licenseNumber },
    traits.applicationStatus && { label: 'Status', value: traits.applicationStatus },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.headerBlue}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={styles.avatar}>
              <span style={{ fontSize: 28, color: '#fff' }}>👤</span>
            </div>
            <div>
              <div style={styles.candidateName}>
                {traits.firstName} {traits.lastName}
              </div>
              {traits.profession && (
                <div style={styles.profession}>{traits.profession}</div>
              )}
            </div>
          </div>
          <button
            onClick={handleCompletePlacement}
            disabled={isCompleting || completed}
            style={{
              ...styles.button,
              background: completed ? '#00A651' : '#fff',
              color: completed ? '#fff' : '#003B5C',
            }}
          >
            {completed ? '✅ Placement Complete!' : isCompleting ? 'Sending…' : '✓ Complete Placement'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {statItems.length > 0 && (
        <div style={styles.statsRow}>
          {statItems.map(({ label, value }) => (
            <div key={label} style={styles.statItem}>
              <div style={styles.statLabel}>{label}</div>
              <div style={styles.statValue}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Contact & Details */}
      <div style={{ padding: '16px 20px' }}>
        <div style={styles.sectionLabel}>Contact</div>
        <div style={styles.detailGrid}>
          {traits.email && <DetailChip label="Email" value={traits.email} />}
          {traits.phone && <DetailChip label="Phone" value={traits.phone} />}
        </div>

        {detailItems.length > 0 && (
          <>
            <div style={{ ...styles.sectionLabel, marginTop: 16 }}>Professional Details</div>
            <div style={styles.detailGrid}>
              {detailItems.map(({ label, value }) => (
                <DetailChip key={label} label={label} value={value} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailChip}>
      <div style={styles.chipLabel}>{label}</div>
      <div style={styles.chipValue}>{value}</div>
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
  headerBlue: {
    background: 'linear-gradient(135deg, #0074A1 0%, #003B5C 100%)',
    padding: '20px 20px',
  },
  avatar: {
    width: 52,
    height: 52,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateName: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  profession: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 500,
    marginTop: 2,
  },
  button: {
    padding: '8px 16px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    background: '#f8fafc',
  },
  statItem: {
    flex: 1,
    padding: '12px 16px',
    textAlign: 'center',
    borderRight: '1px solid #f0f0f0',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 8,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  detailChip: {
    background: '#f9fafb',
    borderRadius: 8,
    padding: '8px 12px',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
  },
};
