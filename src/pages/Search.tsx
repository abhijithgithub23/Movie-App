import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMediaThunk, clearSearchResults } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import { Link } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext'; 

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const { theme } = useTheme(); 
  
  const searchResults = useSelector((state: RootState) => state.media.searchResults);
  const searchStatus = useSelector((state: RootState) => state.media.status.searchResults);
  
  // 1. Initialize State from Session Storage
  const [query, setQuery] = useState(() => sessionStorage.getItem('cv_query') || '');
  const [hasSearched, setHasSearched] = useState(() => sessionStorage.getItem('cv_hasSearched') === 'true');

  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'movie' | 'tv'>(
    () => (sessionStorage.getItem('cv_mediaType') as 'all' | 'movie' | 'tv') || 'all'
  );
  const [selectedGenre, setSelectedGenre] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('cv_genre');
    return saved ? Number(saved) : null;
  });
  const [selectedRating, setSelectedRating] = useState<number>(() => Number(sessionStorage.getItem('cv_rating')) || 0);
  const [selectedYear, setSelectedYear] = useState<string>(() => sessionStorage.getItem('cv_year') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => sessionStorage.getItem('cv_lang') || 'all');

  // 2. Sync ONLY the Filters to Session Storage automatically
  useEffect(() => {
    sessionStorage.setItem('cv_mediaType', selectedMediaType);
    if (selectedGenre !== null) sessionStorage.setItem('cv_genre', String(selectedGenre));
    else sessionStorage.removeItem('cv_genre');
    sessionStorage.setItem('cv_rating', String(selectedRating));
    sessionStorage.setItem('cv_year', selectedYear);
    sessionStorage.setItem('cv_lang', selectedLanguage);
  }, [selectedMediaType, selectedGenre, selectedRating, selectedYear, selectedLanguage]);

  // 3. Safety Check: If page is hard-refreshed, refetch the data
  useEffect(() => {
    if (hasSearched && query && searchResults.length === 0 && searchStatus !== 'loading') {
      dispatch(searchMediaThunk(query));
    }
  }, [dispatch, hasSearched, query, searchResults.length, searchStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch(searchMediaThunk(query));
    setHasSearched(true);
    
    // 4. Save Query to Session Storage ONLY on Submit
    sessionStorage.setItem('cv_query', query);
    sessionStorage.setItem('cv_hasSearched', 'true');
  };

  const handleClearSearch = () => {
    setQuery('');
    setHasSearched(false);
    dispatch(clearSearchResults());
    // Clear the cached query items
    sessionStorage.removeItem('cv_query');
    sessionStorage.removeItem('cv_hasSearched');
  };

  const clearFilters = () => {
    setSelectedMediaType('all');
    setSelectedGenre(null);
    setSelectedRating(0);
    setSelectedYear('all');
    setSelectedLanguage('all');
  };

  const filteredResults = useMemo(() => {
    let results = searchResults.filter((m) => m.media_type === "movie" || m.media_type === "tv");

    if (selectedMediaType !== 'all') {
      results = results.filter((m) => m.media_type === selectedMediaType);
    }
    if (selectedGenre) {
      results = results.filter((m) => m.genre_ids?.includes(selectedGenre));
    }
    if (selectedRating > 0) {
      results = results.filter((m) => (m.vote_average || 0) >= selectedRating);
    }
    if (selectedYear !== 'all') {
      results = results.filter((m) => {
        const dateString = m.release_date || m.first_air_date;
        if (!dateString) return false;
        return dateString.startsWith(selectedYear);
      });
    }
    if (selectedLanguage !== 'all') {
      results = results.filter((m) => m.original_language === selectedLanguage);
    }

    return results.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
      const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
      return dateB - dateA;
    });
  }, [searchResults, selectedMediaType, selectedGenre, selectedRating, selectedYear, selectedLanguage]);

  return (
    <div className="bg-main text-text-main min-h-screen pt-8 px-6 md:px-12 pb-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-8 w-full mx-auto">
        
        {/* COMPREHENSIVE LEFT SIDEBAR */}
        <aside className="w-full md:w-72 flex-shrink-0 z-10">
          <div className="sticky top-24 bg-card-bg/50 backdrop-blur-xl border border-text-muted/20 p-6 rounded-2xl shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar transition-colors duration-300">            
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-text-main">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-text-muted hover:text-text-main underline transition-colors">
                Clear All
              </button>
            </div>

            {/* Media Type Filter */}
            <div className="mb-6 border-b border-text-muted/20 pb-6">
              <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Media Type</h4>
              <div className="flex gap-2 bg-main/50 p-1 rounded-lg border border-text-muted/20">
                {(['all', 'movie', 'tv'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMediaType(type)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      selectedMediaType === type 
                        ? 'bg-btn-bg text-btn-text shadow-md' 
                        : 'text-text-muted hover:text-text-main hover:bg-text-muted/10'
                    }`}
                  >
                    {type === 'tv' ? 'TV Shows' : type === 'all' ? 'All' : 'Movies'}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Filter */}
            <div className="mb-6 border-b border-text-muted/20 pb-6">
              <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Release Year</h4>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-main/50 border border-text-muted/30 text-text-main text-sm rounded-lg focus:ring-btn-bg focus:border-btn-bg block p-2.5 outline-none transition-colors"
              >
                <option value="all">Any Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6 border-b border-text-muted/20 pb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Min Rating</h4>
                <span className="text-text-main font-bold text-sm">{selectedRating > 0 ? `${selectedRating}+` : 'Any'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                step="1"
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="w-full h-2 bg-text-muted/30 rounded-lg appearance-none cursor-pointer accent-btn-bg"
              />
              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Language Filter */}
            <div className="mb-6 border-b border-text-muted/20 pb-6">
              <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Language</h4>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-main/50 border border-text-muted/30 text-text-main text-sm rounded-lg focus:ring-btn-bg focus:border-btn-bg block p-2.5 outline-none transition-colors"
              >
                <option value="all">All Languages</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            {/* Genres Filter */}
            <div>
              <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                      selectedGenre === g.id 
                        ? 'bg-btn-bg text-btn-text border-btn-bg shadow-lg shadow-btn-bg/30' 
                        : 'bg-transparent text-text-muted border-text-muted/30 hover:border-text-muted hover:text-text-main'
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
        <div className="flex-1 w-full z-10">
          <form onSubmit={handleSearch} className="mb-8 relative flex w-full">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                <svg className="h-6 w-6 text-text-muted group-focus-within:text-btn-bg transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <input
                type="text"
                placeholder="Search for Movies or TV shows....."
                className="w-full pl-14 pr-40 py-5 bg-card-bg/50 border border-text-muted/20 rounded-2xl text-lg text-text-main placeholder-text-muted/70 focus:outline-none focus:border-btn-bg focus:ring-1 focus:ring-btn-bg transition-all shadow-xl backdrop-blur-sm"
                value={query}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  setQuery(newQuery);
                  if (!newQuery.trim()) {
                    setHasSearched(false);
                    dispatch(clearSearchResults());
                    // Clear storage if they completely erase the input box manually
                    sessionStorage.removeItem('cv_query');
                    sessionStorage.removeItem('cv_hasSearched');
                  }
                }}
              />
              
              {query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-32 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-main transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 bg-btn-bg text-btn-text px-8 rounded-xl font-bold hover:opacity-90 transition-all shadow-btn-bg/30"
              >
                Search
              </button>
            </div>
          </form>

          {/* RESULTS GRID / LOADING / EMPTY STATE */}
          {!query.trim() ? (
             <div className="flex flex-col items-center justify-center text-center py-32 bg-card-bg/30 rounded-2xl border border-text-muted/20 border-dashed w-full transition-colors duration-300">
               <svg className="w-20 h-20 mb-6 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
               </svg>
               <h2 className="text-3xl font-bold text-text-main mb-3">Ready to explore?</h2>
               <p className="text-text-muted max-w-md">Type a movie or TV show name above to start your search.</p>
             </div>
          ) : searchStatus === "loading" ? (
             <div className="flex items-center justify-center py-32 w-full">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-btn-bg border-b-btn-bg"></div>
             </div>
          ) : hasSearched && filteredResults.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center py-32 bg-card-bg/30 rounded-2xl border border-text-muted/20 border-dashed w-full transition-colors duration-300">
               <svg className="w-20 h-20 mb-6 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
               </svg>
               <h2 className="text-3xl font-bold text-text-main mb-3">No matching results</h2>
               <p className="text-text-muted max-w-md">We couldn't find anything matching your search and filter combination. Try clearing some filters or tweaking your query.</p>
               <button onClick={clearFilters} className="mt-6 text-btn-bg font-semibold hover:opacity-80">
                 Clear all filters
               </button>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
              {filteredResults.map((m) => (
                <Link
                  to={`/details/${m.media_type || 'movie'}/${m.id}`}
                  key={m.id}
                  className="group relative bg-card-bg rounded-2xl overflow-hidden border border-text-muted/20 hover:border-btn-bg/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-btn-bg/20"
                >
                  <div className="absolute top-3 left-3 z-10 bg-main/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-text-main border border-text-muted/20 shadow-sm">
                    {m.media_type === 'tv' ? 'TV Show' : 'Movie'}
                  </div>
                  
                  <div className="aspect-[2/3] w-full bg-main/50 relative overflow-hidden">
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                        alt={m.title || m.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/50 p-4 text-center">
                        <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-main via-main/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-5 absolute bottom-0 left-0 right-0 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <h2 className="font-bold text-text-main leading-tight mb-2 drop-shadow-md">
                      {m.title || m.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-medium text-text-main/80">
                      <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                        ★ {m.vote_average?.toFixed(1) || 'NR'}
                      </span>
                      <span>{(m.release_date || m.first_air_date)?.substring(0, 4) || 'N/A'}</span>
                      <span className="uppercase text-text-muted">{m.original_language || ''}</span>
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