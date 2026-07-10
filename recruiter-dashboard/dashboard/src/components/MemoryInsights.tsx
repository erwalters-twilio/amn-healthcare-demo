import { Brain, Sparkles, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MemoryProfile } from '../types';

interface MemoryInsightsProps {
  memoryProfile: MemoryProfile | null;
}

export function MemoryInsights({ memoryProfile }: MemoryInsightsProps) {
  if (!memoryProfile || (!memoryProfile.observations?.length && !memoryProfile.summaries?.length)) {
    return (
      <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">No insights available yet</p>
        </div>
      </div>
    );
  }

  const { observations, summaries } = memoryProfile;

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="gradient-purple px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">AI Insights</h2>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-sm">
            {(observations?.length || 0) + (summaries?.length || 0)} items
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {/* Key Observations */}
        {observations && observations.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              Key Facts ({observations.length})
            </h3>
            <div className="space-y-3">
              {observations.map((obs, index) => (
                <div
                  key={obs.observationId || index}
                  className="bg-gradient-to-r from-amber-50 to-yellow-50/50 border-l-4 border-amber-400 px-4 py-3 text-sm rounded-r-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <p className="text-gray-800 font-medium leading-relaxed">{obs.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Summaries */}
        {summaries && summaries.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Conversation Summaries ({summaries.length})
            </h3>
            <div className="space-y-4">
              {summaries.map((summary, index) => (
                <div
                  key={summary.summaryId || index}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-l-4 border-blue-400 px-4 py-3.5 rounded-r-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <p className="text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-line">{summary.content}</p>
                  {summary.timestamp && (
                    <p className="text-xs text-gray-500 mt-3 font-semibold">
                      {format(new Date(summary.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
