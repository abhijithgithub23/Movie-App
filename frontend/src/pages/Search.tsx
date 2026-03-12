// src/pages/Search/Search.tsx
import React, { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMediaThunk, clearSearchResults } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';

// Import your newly split components
import {type FilterState, type MediaItem } from '../components/Search/searchConstants';
import SearchForm from '../components/Search/SearchForm';
import FilterSidebar from '../components/Search/FilterSidebar';
import ResultsArea from '../components/Search/ResultsArea';

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  
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

  useEffect(() => {
    sessionStorage.setItem('cv_mediaType', filters.mediaType);
    sessionStorage.setItem('cv_year', filters.year);
    sessionStorage.setItem('cv_rating', String(filters.rating));
    sessionStorage.setItem('cv_lang', filters.language);
    if (filters.genre !== null) sessionStorage.setItem('cv_genre', String(filters.genre));
    else sessionStorage.removeItem('cv_genre');
  }, [filters]);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('cv_query');
    const savedHasSearched = sessionStorage.getItem('cv_hasSearched') === 'true';
    if (savedHasSearched && savedQuery && searchResults.length === 0) {
      dispatch(searchMediaThunk(savedQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSearchSubmit = useCallback((newQuery: string) => {
    dispatch(searchMediaThunk(newQuery));
    setHasSearched(true);
    setCommittedQuery(newQuery);
    sessionStorage.setItem('cv_query', newQuery);
    sessionStorage.setItem('cv_hasSearched', 'true');
  }, [dispatch]);

  const handleClearEverything = useCallback(() => {
    setCommittedQuery('');
    setHasSearched(false);
    dispatch(clearSearchResults());
    sessionStorage.removeItem('cv_query');
    sessionStorage.removeItem('cv_hasSearched');
  }, [dispatch]);

  const filteredResults = useMemo(() => {
    let results = searchResults.filter((m) => m.media_type === "movie" || m.media_type === "tv");
    if (filters.mediaType !== 'all') results = results.filter((m) => m.media_type === filters.mediaType);
    if (filters.genre) results = results.filter((m) => m.genre_ids?.includes(filters.genre!));
    if (filters.rating > 0) results = results.filter((m) => (m.vote_average || 0) >= filters.rating);
    if (filters.year !== 'all') results = results.filter((m) => (m.release_date || m.first_air_date)?.startsWith(filters.year));
    if (filters.language !== 'all') results = results.filter((m) => m.original_language === filters.language);

    return results.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
      const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
      return dateB - dateA;
    });
  }, [searchResults, filters]);

  return (
    <div className="bg-main text-text-main min-h-screen pt-8 px-6 md:px-12 pb-12 transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-8 w-full mx-auto">
        <FilterSidebar filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} />
        <div className="flex-1 w-full z-10">
          <SearchForm initialQuery={committedQuery} onSearchSubmit={handleSearchSubmit} onClear={handleClearEverything} />
          <div className={`transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <ResultsArea 
              query={committedQuery} 
              searchStatus={searchStatus} 
              hasSearched={hasSearched} 
              filteredResults={filteredResults} 
              clearFilters={clearFilters} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;