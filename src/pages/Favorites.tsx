import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store/store';
import type { Media } from '../types';
import MediaCard from '../components/Media/MediaCard';

const Favorites = () => {
  const favorites = useSelector((state: RootState) => state.favorites.items) as Media[];

  // 1. Polished Empty State
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px)] bg-black px-6 pt-20">
        <div className="bg-red-950/20 p-10 rounded-3xl shadow-2xl shadow-red-900/10 max-w-md w-full text-center border border-red-900/30 backdrop-blur-md">
          <div className="bg-red-950/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/50 shadow-inner">
            <svg 
              className="w-12 h-12 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            No favorites yet
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed text-lg">
            You haven't added any movies or TV shows to your favorites. Start exploring and save the ones you love!
          </p>
          <Link 
            to="/" 
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:-translate-y-1"
          >
            Explore Media
          </Link>
        </div>
      </div>
    );
  }

  // 2. Polished Populated State
  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600/10 p-3 rounded-2xl border border-red-600/20">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              My Favorites
            </h1>
          </div>
          
          {/* Count Badge */}
          <div className="bg-red-950/60 text-red-400 text-sm font-bold tracking-wider uppercase px-5 py-2 rounded-full border border-red-900/50 w-fit shadow-lg">
            {favorites.length} {favorites.length === 1 ? 'Title' : 'Titles'} Saved
          </div>
        </div>

        {/* Responsive Grid - Now safely reversed to show newest first! */}
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