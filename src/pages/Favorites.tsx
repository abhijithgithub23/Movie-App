// src/pages/Favorites.tsx
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store/store';
import MediaCard from '../components/Media/MediaCard';

const Favorites = () => {
  const { items: favorites } = useSelector((state: RootState) => state.favorites);
  
  // Access the internal persist state to see if loading is finished
  const isRehydrated = useSelector((state: RootState) => state.favorites._persist?.rehydrated);

  // 0. Loading State (Prevents UI flicker on refresh)
  if (!isRehydrated) {
    // UPDATED: bg-main
    return <div className="min-h-screen bg-main transition-colors duration-300" />; 
  }

  // 1. Polished Empty State
  if (favorites.length === 0) {
    return (
      // UPDATED: bg-main
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px)] bg-main px-6 pt-20 transition-colors duration-300">
        {/* UPDATED: bg-card-bg/50, border-text-muted/20, shadow-btn-bg/10 */}
        <div className="bg-card-bg/50 p-10 rounded-3xl shadow-2xl shadow-btn-bg/10 max-w-md w-full text-center border border-text-muted/20 backdrop-blur-md transition-colors duration-300">
          {/* UPDATED: bg-btn-bg/10, border-btn-bg/30 */}
          <div className="bg-btn-bg/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-btn-bg/30 shadow-inner">
            <svg 
              className="w-12 h-12 text-btn-bg" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          {/* UPDATED: text-text-main */}
          <h2 className="text-3xl font-extrabold text-text-main mb-3 tracking-tight">
            No favorites yet
          </h2>
          {/* UPDATED: text-text-muted */}
          <p className="text-text-muted mb-8 leading-relaxed text-lg">
            You haven't added any movies or TV shows to your favorites. Start exploring and save the ones you love!
          </p>
          {/* UPDATED: bg-btn-bg, text-btn-text, shadow-btn-bg/30 */}
          <Link 
            to="/" 
            className="inline-block bg-btn-bg text-btn-text font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-btn-bg/30 hover:-translate-y-1 hover:opacity-90"
          >
            Explore Media
          </Link>
        </div>
      </div>
    );
  }

  // 2. Polished Populated State
  return (
    // UPDATED: bg-main
    <div className="min-h-screen bg-main pt-24 pb-12 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        {/* UPDATED: border-text-muted/20 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-text-muted/20 pb-6 transition-colors duration-300">
          <div className="flex items-center gap-4">
            {/* UPDATED: bg-btn-bg/10, border-btn-bg/20 */}
            <div className="bg-btn-bg/10 p-3 rounded-2xl border border-btn-bg/20">
              <svg className="w-8 h-8 text-btn-bg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            {/* UPDATED: text-text-main */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-main tracking-tight drop-shadow-md">
              My Favorites
            </h1>
          </div>
          
          {/* UPDATED: bg-btn-bg/10, text-btn-bg, border-btn-bg/30 */}
          <div className="bg-btn-bg/10 text-btn-bg text-sm font-bold tracking-wider uppercase px-5 py-2 rounded-full border border-btn-bg/30 w-fit shadow-lg backdrop-blur-sm">
            {favorites.length} {favorites.length === 1 ? 'Title' : 'Titles'} Saved
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
          {[...favorites].reverse().map((media) => (
            <MediaCard 
              key={media.id} 
              media={{ ...media, media_type: media.media_type || 'movie' }} 
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Favorites;