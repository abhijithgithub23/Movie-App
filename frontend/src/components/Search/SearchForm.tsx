// src/pages/Search/SearchForm.tsx
import React, { memo, useEffect, useRef, useCallback } from 'react';

interface SearchFormProps {
  initialQuery: string;
  onSearchSubmit: (query: string) => void;
  onClear: () => void;
}

const SearchForm = memo(({ initialQuery, onSearchSubmit, onClear }: SearchFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const clearBtnRef = useRef<HTMLButtonElement>(null);

const handleNativeInput = useCallback(() => {
  if (!clearBtnRef.current || !inputRef.current) return;

  const value = inputRef.current.value;

  if (value.length > 0) {
    clearBtnRef.current.style.opacity = '1';
    clearBtnRef.current.style.pointerEvents = 'auto';
  } else {
    clearBtnRef.current.style.opacity = '0';
    clearBtnRef.current.style.pointerEvents = 'none';
    onClear();
  }
}, [onClear]);

 useEffect(() => {
  handleNativeInput();
}, [handleNativeInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentVal = inputRef.current?.value || '';
    if (currentVal.trim()) onSearchSubmit(currentVal);
    else onClear();
  };

  const handleClearClick = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      handleNativeInput(); 
    }
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 relative flex w-full">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <svg className="h-6 w-6 text-text-muted group-focus-within:text-btn-bg transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          defaultValue={initialQuery}
          onInput={handleNativeInput}
          type="text"
          placeholder="Search for Movies or TV shows....."
          className="w-full pl-14 pr-40 py-5 bg-card-bg/50 border border-text-muted/20 rounded-2xl text-lg text-text-main placeholder-text-muted/70 focus:outline-none focus:border-btn-bg focus:ring-1 focus:ring-btn-bg transition-all shadow-xl backdrop-blur-sm"
        />
        <button
          ref={clearBtnRef}
          type="button"
          onClick={handleClearClick}
          className="absolute right-32 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-text-main transition-colors z-10 opacity-0 pointer-events-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button type="submit" className="absolute right-3 top-3 bottom-3 bg-btn-bg text-btn-text px-8 rounded-xl font-bold hover:opacity-90 transition-all shadow-btn-bg/30">
          Search
        </button>
      </div>
    </form>
  );
});

export default SearchForm;