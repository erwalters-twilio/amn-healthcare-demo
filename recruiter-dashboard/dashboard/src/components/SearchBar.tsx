import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import { CandidateSearchResult } from '../types';

interface SearchBarProps {
  onSelectCandidate: (identifier: string) => void;
}

export function SearchBar({ onSelectCandidate }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CandidateSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await api.search(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectResult = (identifier: string) => {
    setShowResults(false);
    setQuery('');
    onSelectCandidate(identifier);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm font-medium"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.identifier}
              onClick={() => handleSelectResult(result.identifier)}
              className="w-full px-5 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="font-bold text-gray-900 text-base">
                {result.name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-600 mt-1.5 flex items-center gap-3 flex-wrap">
                {result.email && <span className="font-medium">{result.email}</span>}
                {result.phone && <span className="font-medium">{result.phone}</span>}
                {result.profession && (
                  <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold text-xs shadow-sm">
                    {result.profession}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-50 px-5 py-4">
          <p className="text-gray-600 text-sm text-center font-medium">No candidates found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
