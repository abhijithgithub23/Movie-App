import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMediaThunk, clearSearchResults } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';

import { type FilterState, type MediaItem } from '../components/Search/searchConstants';
import SearchForm from '../components/Search/SearchForm';
import FilterSidebar from '../components/Search/FilterSidebar';
import ResultsArea from '../components/Search/ResultsArea';

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // The results from Redux are now pre-filtered by the backend!
  const searchResults = useSelector((state: RootState) => state.media.searchResults as MediaItem[]);
  const searchStatus = useSelector((state: RootState) => state.media.status.searchResults);
  
  const [committedQuery, setCommittedQuery] = useState(() => sessionStorage.getItem('cv_query') || '');
  const [hasSearched, setHasSearched] = useState(() => sessionStorage.getItem('cv_hasSearched') === 'true');

  const [filters, setFilters] = useState<FilterState>(() => ({
    mediaType: (sessionStorage.getItem('cv_mediaType') as 'all' | 'movie' | 'tv') || 'all',
    year: sessionStorage.getItem('cv_year') || 'all',
    rating: Number(sessionStorage.getItem('cv_rating')) || 0,
    language: sessionStorage.getItem('cv_lang') || 'all',
    genre: sessionStorage.getItem('cv_genre') ? Number(sessionStorage.getItem('cv_genre')) : null,
  }));

  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, [key]: value }));
    });
  }, []);

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setFilters({ mediaType: 'all', year: 'all', rating: 0, language: 'all', genre: null });
    });
  }, []);

  // Save filters to session storage
  useEffect(() => {
    sessionStorage.setItem('cv_mediaType', filters.mediaType);
    sessionStorage.setItem('cv_year', filters.year);
    sessionStorage.setItem('cv_rating', String(filters.rating));
    sessionStorage.setItem('cv_lang', filters.language);
    if (filters.genre !== null) sessionStorage.setItem('cv_genre', String(filters.genre));
    else sessionStorage.removeItem('cv_genre');
  }, [filters]);

  // FIRE BACKEND SEARCH WHENEVER FILTERS OR QUERY CHANGE
  useEffect(() => {
    if (hasSearched && committedQuery) {
      // Send both the query AND the filters to the backend
      dispatch(searchMediaThunk({ query: committedQuery, filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, committedQuery, hasSearched, dispatch]); 

  const handleSearchSubmit = useCallback((newQuery: string) => {
    setHasSearched(true);
    setCommittedQuery(newQuery);
    sessionStorage.setItem('cv_query', newQuery);
    sessionStorage.setItem('cv_hasSearched', 'true');
    // The useEffect above will automatically catch this change and fire the dispatch!
  }, []);

  const handleClearEverything = useCallback(() => {
    setCommittedQuery('');
    setHasSearched(false);
    dispatch(clearSearchResults());
    sessionStorage.removeItem('cv_query');
    sessionStorage.removeItem('cv_hasSearched');
  }, [dispatch]);

  return (
    <div className="bg-main text-text-main min-h-screen pt-8 px-6 md:px-12 pb-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-8 w-full mx-auto">
        <FilterSidebar filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} />
        <div className="flex-1 w-full z-10">
          <SearchForm initialQuery={committedQuery} onSearchSubmit={handleSearchSubmit} onClear={handleClearEverything} />
          <div className={`transition-opacity duration-200 ${isPending || searchStatus === 'loading' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <ResultsArea 
              query={committedQuery} 
              searchStatus={searchStatus} 
              hasSearched={hasSearched} 
              filteredResults={searchResults} // Just pass the raw Redux array directly!
              clearFilters={clearFilters} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;