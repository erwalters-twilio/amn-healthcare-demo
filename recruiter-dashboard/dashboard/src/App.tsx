import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ProfileSection } from './components/ProfileSection';
import { EventTimeline } from './components/EventTimeline';
import { ConversationView } from './components/ConversationView';
import { MemoryInsights } from './components/MemoryInsights';
import { ApplicationContext } from './components/ApplicationContext';
import { api } from './lib/api';
import { CandidateData } from './types';

function App() {
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-load candidate on mount - check URL params first, then current candidate
  useEffect(() => {
    // Check if there's a candidate ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const candidateId = urlParams.get('candidate');

    if (candidateId) {
      // Load specific candidate from URL
      console.log('Loading candidate from URL:', candidateId);
      handleSearchSelect(candidateId);
      // Clean up URL without page reload
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Fall back to current candidate
      loadCurrentCandidate();
    }
  }, []);

  async function loadCurrentCandidate() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCurrentCandidate();
      setCandidate(data);
    } catch (err: any) {
      console.error('Error loading current candidate:', err);
      setError(null); // Don't show error if no current candidate
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchSelect(identifier: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCandidateDetail(identifier);
      setCandidate(data);
    } catch (err: any) {
      console.error('Error loading candidate:', err);
      setError(err.message || 'Failed to load candidate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-6">
              <img src="/amn-logo.jpeg" alt="AMN Healthcare" className="h-14 drop-shadow-md" />
              <div className="border-l-2 border-gray-300 pl-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruiter Dashboard</h1>
                <p className="text-gray-600 text-sm font-medium mt-0.5">Candidate Intelligence Platform</p>
              </div>
            </div>
            {candidate && (
              <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl px-5 py-3 border border-blue-200/60 shadow-sm">
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Active Candidate</p>
                  <p className="text-gray-900 font-bold text-lg mt-0.5">
                    {candidate.profile.traits.firstName} {candidate.profile.traits.lastName}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    {candidate.profile.traits.profession || 'Healthcare Professional'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <SearchBar onSelectCandidate={handleSearchSelect} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="spinner drop-shadow-lg"></div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-6 text-center shadow-lg">
            <p className="text-red-700 font-semibold text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && !candidate && (
          <div className="bg-white/90 backdrop-blur border border-gray-200/60 rounded-2xl p-16 text-center shadow-xl">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Candidate Selected</h3>
            <p className="text-gray-600 text-lg font-medium">
              Search for a candidate above or wait for a call transfer
            </p>
          </div>
        )}

        {!loading && !error && candidate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Column - Profile & Activity */}
            <div className="lg:col-span-2 space-y-8">
              <ProfileSection profile={candidate.profile} />
              <ApplicationContext applicationContext={candidate.applicationContext} />
              <EventTimeline events={candidate.events} />
            </div>

            {/* Right Column - Conversations & AI Insights */}
            <div className="space-y-8">
              <MemoryInsights memoryProfile={candidate.memoryProfile} />
              <ConversationView conversations={candidate.conversations} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="border-t border-gray-200/50 pt-6">
            <p className="text-gray-500 text-sm font-medium">
              {candidate && `Last updated: ${new Date(candidate.lastUpdated).toLocaleString()}`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
