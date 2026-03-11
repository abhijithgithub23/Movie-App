import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMediaThunk } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import { Link } from 'react-router-dom';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

// Generate the last 30 years dynamically
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const searchResults = useSelector((state: RootState) => state.media.searchResults);
  // NEW: Grab the search loading status from Redux
  const searchStatus = useSelector((state: RootState) => state.media.status.searchResults);
  
  // Search State
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  // Filter States
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Fetch Genres
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => setGenres(data.genres))
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch(searchMediaThunk(query));
    setHasSearched(true);
    // Keeping the query in the input box is usually better UX so the user knows what they searched for,
    // but I left your setQuery('') here if you prefer it to clear out!
    setQuery(''); 
  };

  const clearFilters = () => {
    setSelectedMediaType('all');
    setSelectedGenre(null);
    setSelectedRating(0);
    setSelectedYear('all');
    setSelectedLanguage('all');
  };

  // MULTI-FILTER LOGIC
  const filteredResults = useMemo(() => {
    // 1. Start with only movies and tv shows
    let results = searchResults.filter((m) => m.media_type === "movie" || m.media_type === "tv");

    // 2. Filter by Media Type
    if (selectedMediaType !== 'all') {
      results = results.filter((m) => m.media_type === selectedMediaType);
    }

    // 3. Filter by Genre
    if (selectedGenre) {
      results = results.filter((m) => m.genre_ids?.includes(selectedGenre));
    }

    // 4. Filter by Rating (Minimum Vote Average)
    if (selectedRating > 0) {
      results = results.filter((m) => (m.vote_average || 0) >= selectedRating);
    }

    // 5. Filter by Year
    if (selectedYear !== 'all') {
      results = results.filter((m) => {
        const dateString = m.release_date || m.first_air_date;
        if (!dateString) return false;
        return dateString.startsWith(selectedYear);
      });
    }

    // 6. Filter by Language
    if (selectedLanguage !== 'all') {
      results = results.filter((m) => m.original_language === selectedLanguage);
    }

    // 7. Sort by latest date
    return results.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
      const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
      return dateB - dateA;
    });
  }, [searchResults, selectedMediaType, selectedGenre, selectedRating, selectedYear, selectedLanguage]);

  return (
    <div className="bg-black text-white min-h-screen pt-8 px-6 md:px-12 pb-12">
      <div className="flex flex-col md:flex-row gap-8 w-full mx-auto">
        
        {/* COMPREHENSIVE LEFT SIDEBAR */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-gray-900/30 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar">            
            
            {/* Filter Content (Unchanged) */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-red-500">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white underline transition-colors">
                Clear All
              </button>
            </div>

            {/* Media Type Filter */}
            <div className="mb-6 border-b border-gray-800 pb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Media Type</h4>
              <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-gray-800">
                {(['all', 'movie', 'tv'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMediaType(type)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      selectedMediaType === type ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {type === 'tv' ? 'TV Shows' : type === 'all' ? 'All' : 'Movies'}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div className="mb-6 border-b border-gray-800 pb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Release Year</h4>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
              >
                <option value="all">Any Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6 border-b border-gray-800 pb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Min Rating</h4>
                <span className="text-red-500 font-bold text-sm">{selectedRating > 0 ? `${selectedRating}+` : 'Any'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Language Filter */}
            <div className="mb-6 border-b border-gray-800 pb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Language</h4>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none"
              >
                <option value="all">All Languages</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Genres Filter */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                      selectedGenre === g.id 
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/30' 
                        : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT: SEARCH & RESULTS */}
        <div className="flex-1 w-full">
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="mb-8 relative flex w-full">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <svg className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for Movies or TV shows....."
                className="w-full pl-14 pr-32 py-5 bg-gray-900/30 border border-gray-800 rounded-2xl text-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xl backdrop-blur-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 bg-indigo-600 px-8 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
              >
                Search
              </button>
            </div>
          </form>

          {/* RESULTS GRID / LOADING / EMPTY STATE */}
          {searchStatus === "loading" ? (
             // NEW: Show spinner while loading
             <div className="flex items-center justify-center py-32 w-full">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600"></div>
             </div>
          ) : hasSearched && filteredResults.length === 0 ? (
             // Show empty state ONLY if we are done loading and there are no results
             <div className="flex flex-col items-center justify-center text-center py-32 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed w-full">
               <svg className="w-20 h-20 mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
               </svg>
               <h2 className="text-3xl font-bold text-gray-300 mb-3">No matching results</h2>
               <p className="text-gray-500 max-w-md">We couldn't find anything matching your search and filter combination. Try clearing some filters or tweaking your query.</p>
               <button onClick={clearFilters} className="mt-6 text-indigo-400 font-semibold hover:text-indigo-300">
                 Clear all filters
               </button>
             </div>
          ) : (
             // Show the actual results
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
              {filteredResults.map((m) => (
                <Link
                  to={`/details/${m.media_type || 'movie'}/${m.id}`}
                  key={m.id}
                  className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
                >
                  <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white border border-white/10 shadow-sm">
                    {m.media_type === 'tv' ? 'TV Show' : 'Movie'}
                  </div>
                  
                  <div className="aspect-[2/3] w-full bg-gray-800 relative overflow-hidden">
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                        alt={m.title || m.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center">
                        <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-5 absolute bottom-0 left-0 right-0 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <h2 className="font-bold text-white leading-tight mb-2 drop-shadow-md">
                      {m.title || m.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-300">
                      <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                        ★ {m.vote_average?.toFixed(1) || 'NR'}
                      </span>
                      <span>{(m.release_date || m.first_air_date)?.substring(0, 4) || 'N/A'}</span>
                      <span className="uppercase text-gray-400">{m.original_language || ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Search;