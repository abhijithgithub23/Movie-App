// src/pages/Search/FilterSidebar.tsx
import React, { memo } from 'react';
import { LANGUAGES, YEARS, GENRES, type FilterState } from './searchConstants';

interface FilterSidebarProps {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
}

const FilterSidebar = memo(({ filters, updateFilter, clearFilters }: FilterSidebarProps) => {
  return (
    <aside className="w-full md:w-72 flex-shrink-0 z-10">
      <div className="sticky top-24 bg-card-bg/50 backdrop-blur-xl border border-text-muted/20 p-6 rounded-2xl shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar transition-colors duration-300">            
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-text-main">Filters</h3>
          <button onClick={clearFilters} className="text-xs text-text-muted hover:text-text-main underline transition-colors">Clear All</button>
        </div>

        {/* Media Type Filter */}
        <div className="mb-6 border-b border-text-muted/20 pb-6">
          <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Media Type</h4>
          <div className="flex gap-2 bg-main/50 p-1 rounded-lg border border-text-muted/20">
            {(['all', 'movie', 'tv'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('mediaType', type)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  filters.mediaType === type ? 'bg-btn-bg text-btn-text shadow-md' : 'text-text-muted hover:text-text-main hover:bg-text-muted/10'
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
            value={filters.year}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="w-full bg-main/50 border border-text-muted/30 text-text-main text-sm rounded-lg focus:ring-btn-bg focus:border-btn-bg block p-2.5 outline-none transition-colors"
          >
            <option value="all">Any Year</option>
            {YEARS.map(year => <option key={year} value={year.toString()}>{year}</option>)}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="mb-6 border-b border-text-muted/20 pb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Min Rating</h4>
            <span className="text-text-main font-bold text-sm">{filters.rating > 0 ? `${filters.rating}+` : 'Any'}</span>
          </div>
          <input
            type="range" min="0" max="9" step="1"
            value={filters.rating}
            onChange={(e) => updateFilter('rating', Number(e.target.value))}
            className="w-full h-2 bg-text-muted/30 rounded-lg appearance-none cursor-pointer accent-btn-bg"
          />
          <div className="flex justify-between text-xs text-text-muted mt-2">
            <span>0</span><span>5</span><span>10</span>
          </div>
        </div>

        {/* Language Filter */}
        <div className="mb-6 border-b border-text-muted/20 pb-6">
          <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Language</h4>
          <select
            value={filters.language}
            onChange={(e) => updateFilter('language', e.target.value)}
            className="w-full bg-main/50 border border-text-muted/30 text-text-main text-sm rounded-lg focus:ring-btn-bg focus:border-btn-bg block p-2.5 outline-none transition-colors"
          >
            <option value="all">All Languages</option>
            {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>
        </div>

        {/* Genres Filter */}
        <div>
          <h4 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Genres</h4>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => updateFilter('genre', filters.genre === g.id ? null : g.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                  filters.genre === g.id 
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
  );
});

export default FilterSidebar;