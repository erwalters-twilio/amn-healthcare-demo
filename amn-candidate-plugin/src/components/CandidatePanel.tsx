import React, { useState, useEffect } from 'react';
import { CandidateData } from '../types';
import { fetchCandidateData } from '../services/candidateApi';
import { ProfileSection } from './ProfileSection';
import { ApplicationContext } from './ApplicationContext';
import { MemoryInsights } from './MemoryInsights';
import { ConversationView } from './ConversationView';
import { EventsTimeline } from './EventsTimeline';

interface CandidatePanelProps {
  task: any;
}

export function CandidatePanel({ task }: CandidatePanelProps) {
  const [data, setData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // phone: set via TaskAttributes; fall back to `to` for outbound calls
  const phone = task?.attributes?.phone || task?.attributes?.to;

  useEffect(() => {
    if (!phone) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetchCandidateData(phone)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [phone]);

  if (!phone) {
    return (
      <div style={containerStyle}>
        <div style={messageStyle}>No candidate phone found in task attributes.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <span>Loading candidate profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <strong>Error loading profile:</strong> {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={containerStyle}>
      <ProfileSection profile={data.profile} />
      <ApplicationContext applicationContext={data.applicationContext} />
      <EventsTimeline events={data.events || []} />
      <MemoryInsights memoryProfile={data.memoryProfile} />
      <ConversationView conversations={data.conversations} />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '12px',
  overflowY: 'auto',
  height: '100%',
  background: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const messageStyle: React.CSSProperties = {
  padding: 20,
  color: '#6b7280',
  fontSize: 13,
  textAlign: 'center',
};

const loadingStyle: React.CSSProperties = {
  padding: 32,
  color: '#6b7280',
  fontSize: 13,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const spinnerStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: '3px solid #e5e7eb',
  borderTopColor: '#0074A1',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const errorStyle: React.CSSProperties = {
  padding: 16,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 8,
  color: '#dc2626',
  fontSize: 13,
};
