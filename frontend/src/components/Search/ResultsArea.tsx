// src/pages/Search/ResultsArea.tsx
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { type MediaItem } from './searchConstants';
import LoadingSpinner from '../ui/LoadingSpinner';

// The individual card
const MediaCard = memo(({ m }: { m: MediaItem }) => (
  <Link to={`/details/${m.media_type || 'movie'}/${m.id}`} className="group relative bg-card-bg rounded-2xl overflow-hidden border border-text-muted/20 hover:border-btn-bg/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-btn-bg/20">
    <div className="absolute top-3 left-3 z-10 bg-main/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-text-main border border-text-muted/20 shadow-sm">
      {m.media_type === 'tv' ? 'TV Show' : 'Movie'}
    </div>
    <div className="aspect-[2/3] w-full bg-main/50 relative overflow-hidden">
      {m.poster_path ? (
        <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} alt={m.title || m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/50 p-4 text-center">
          <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-main via-main/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <div className="p-5 absolute bottom-0 left-0 right-0 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
      <h2 className="font-bold text-text-main leading-tight mb-2 drop-shadow-md">{m.title || m.name}</h2>
      <div className="flex items-center gap-3 text-xs font-medium text-text-main/80">
        {/* FIX: Wrapped m.vote_average in Number() before calling .toFixed() */}
        <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
          ★ {m.vote_average ? Number(m.vote_average).toFixed(1) : 'NR'}
        </span>
        <span>{(m.release_date || m.first_air_date)?.substring(0, 4) || 'N/A'}</span>
        <span className="uppercase text-text-muted">{m.original_language || ''}</span>
      </div>
    </div>
  </Link>
));

interface ResultsAreaProps {
  query: string;
  searchStatus: string;
  hasSearched: boolean;
  filteredResults: MediaItem[];
  clearFilters: () => void;
}

// The main grid area
const ResultsArea = memo(({ query, searchStatus, hasSearched, filteredResults, clearFilters }: ResultsAreaProps) => {
  if (!query.trim()) return (
    <div className="flex flex-col items-center justify-center text-center py-32 bg-card-bg/30 rounded-2xl border border-text-muted/20 border-dashed w-full">
      <svg className="w-20 h-20 mb-6 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
      <h2 className="text-3xl font-bold text-text-main mb-3">Ready to explore?</h2>
      <p className="text-text-muted max-w-md">Type a movie or TV show name above to start your search.</p>
    </div>
  );
  
  if (searchStatus === "loading")  return <LoadingSpinner />;

  
  if (hasSearched && filteredResults.length === 0) return (
    <div className="flex flex-col items-center justify-center text-center py-32 bg-card-bg/30 rounded-2xl border border-text-muted/20 border-dashed w-full">
      <svg className="w-20 h-20 mb-6 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
      <h2 className="text-3xl font-bold text-text-main mb-3">No matching results</h2>
      <p className="text-text-muted max-w-md">We couldn't find anything matching your search and filter combination. Try clearing some filters or tweaking your query.</p>
      <button onClick={clearFilters} className="mt-6 text-btn-bg font-semibold hover:opacity-80">Clear all filters</button>
    </div>
  );
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
      {filteredResults.map((m: MediaItem) => <MediaCard key={m.id} m={m} />)}
    </div>
  );
});

export default ResultsArea;