import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tmdbApi } from '../api/tmdb';
import { deleteMedia } from '../features/media/mediaSlice';
import { toggleFavorite } from '../features/favorites/favoritesSlice';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast'; 
import type { RootState, AppDispatch } from '../store/store';
import type { Media } from '../types';
import { useTheme } from '../context/ThemeContext'; 

// --- NEW PROPER TYPESCRIPT INTERFACES ---
interface CastMember {
  id: number;
  name: string;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
}

interface ProductionCompany {
  id: number;
  name: string;
}

interface Creator {
  id: number;
  name: string;
}

// We extend your base Media type to include the deep data from PostgreSQL
interface ExtendedMedia extends Media {
  type?: 'movie' | 'tv'; // <-- ADDED THIS LINE
  credits?: {
    cast?: CastMember[];
    crew?: CrewMember[];
  };
  created_by?: Creator[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  production_companies?: ProductionCompany[];
}
// ----------------------------------------

const Details = () => {
  const { id: paramId, type: paramType } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth0();
  const { theme } = useTheme(); 
  
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  const id = paramId || '';
  const type = paramType || '';

  // Redux State Selectors
  const trending = useSelector((state: RootState) => state.media.trending);
  const movies = useSelector((state: RootState) => state.media.movies);
  const tvShows = useSelector((state: RootState) => state.media.tvShows);
  const customMovies = useSelector((state: RootState) => state.media.customMovies);
  const editedMedia = useSelector((state: RootState) => state.media.edited);
  const favorites = useSelector((state: RootState) => state.favorites.items);

  const [tmdbMedia, setTmdbMedia] = useState<Media | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find the media in Redux, prioritizing edits and favorites first
  const reduxMedia: Media | undefined = useMemo(() => {
    return editedMedia.find((m) => String(m.id) === id) ||
           customMovies.find((m) => String(m.id) === id) ||
           favorites.find((m) => String(m.id) === id) ||
           trending.find((m) => String(m.id) === id) ||
           movies.find((m) => String(m.id) === id) ||
           tvShows.find((m) => String(m.id) === id);
  }, [id, editedMedia, customMovies, favorites, trending, movies, tvShows]);

  // Merge DB data and Local data (Local data ALWAYS wins)
  const media: Media | null = useMemo(() => {
    if (reduxMedia && tmdbMedia) {
      return {
        ...tmdbMedia,
        ...reduxMedia,
        genres: reduxMedia.genres || tmdbMedia.genres,
      };
    }
    return reduxMedia ?? tmdbMedia ?? null;
  }, [reduxMedia, tmdbMedia]);

  const isFavorited = useMemo(() => {
    return favorites.some((item) => String(item.id) === String(id));
  }, [favorites, id]);

  // API Gatekeeper Logic
  const isCustom = String(id).startsWith('custom-');
  const hasFullData = Boolean(reduxMedia?.genres?.length);
  const hasLocalData = Boolean(reduxMedia);

  useEffect(() => {
    if (!id || !type) return;
    
    // 1. Skip fetch entirely if it's a custom item OR if we already have the complete details cached
    if (isCustom || hasFullData) {
      return;
    }

    // 2. Otherwise, fetch missing details from our Postgres Backend
    let canceled = false;
    tmdbApi
      .get<Media>(`/media/${type}/${id}`)
      .then((res) => {
        if (!canceled) setTmdbMedia(res.data);
      })
      .catch(() => {
        // 3. Only navigate away if backend fails AND we have absolutely no local data to show
        if (!canceled && !hasLocalData) {
          navigate('/');
        }
      });

    return () => { canceled = true; };
  }, [id, type, isCustom, hasFullData, hasLocalData, navigate]);

  if (!media) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-main text-btn-bg transition-colors duration-300">
        <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // --- IMAGE URL LOGIC FIX ---
  const isValidAbsoluteUrl = (path: string) => 
    path.startsWith('http') || path.startsWith('data:image/') || path.startsWith('blob:');

  const posterUrl = media.poster_path
    ? isValidAbsoluteUrl(media.poster_path)
      ? media.poster_path
      : `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder.jpg';

  const backdropUrl = media.backdrop_path
    ? isValidAbsoluteUrl(media.backdrop_path)
      ? media.backdrop_path
      : `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;
  // ---------------------------

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  const confirmDelete = () => {
    if (media.id) {
      try {
        dispatch(deleteMedia(media.id));
        setShowDeleteModal(false);
        
        toast.success(`"${media.title || media.name}" was deleted successfully!`, {
          duration: 2000
        });

        setTimeout(() => {
          navigate('/');
        }, 1000);

      } catch (error) {
        console.error("Failed to delete media:", error);
        toast.error("Failed to delete media. Please try again.");
      }
    }
  };

  const handleFavoriteToggle = () => {
    dispatch(toggleFavorite(media));
  };

  // EXTRACTING DEEP DATA TYPE-SAFELY
  const mediaData = media as ExtendedMedia;
  const topCast = mediaData.credits?.cast?.slice(0, 10) || [];
  const director = mediaData.credits?.crew?.find((c) => c.job === 'Director')?.name;
  const creators = mediaData.created_by?.map((c) => c.name).join(', ');

  return (
    <>
      <div className="bg-main min-h-screen text-text-main pb-20 -mt-20 md:-mt-24 transition-colors duration-300">
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
          {backdropUrl ? (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-main/20" />
          )}
          
          {/* Conditional gradients to hide on light theme */}
          <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'light' ? 'bg-transparent' : 'bg-gradient-to-t from-main via-main/60 to-transparent'}`} />
          <div className={`absolute inset-0 transition-colors duration-1000 ${theme === 'light' ? 'bg-transparent' : 'bg-gradient-to-r from-main/90 via-main/40 to-transparent'}`} />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-72 md:-mt-96 relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col items-center">
            {/* Shadow matches theme main background */}
            <img
              src={posterUrl}
              alt={media.title || media.name}
              className="w-64 md:w-full rounded-2xl shadow-2xl shadow-main/80 border border-text-muted/20 object-cover"
            />
            
            <div className="w-full mt-6 flex justify-center items-center gap-6">
              <button
                onClick={handleFavoriteToggle}
                className={`transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none p-3 rounded-full ${
                    isFavorited ? 'bg-btn-bg/10' : 'hover:bg-text-muted/10'
                }`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill={isFavorited ? "currentColor" : "none"}
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className={`w-10 h-10 transition-colors ${isFavorited ? 'text-btn-bg' : 'text-text-main'}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>

              {isAdmin && (
                <div className="flex justify-center items-center gap-4 border-l pl-6 border-text-muted/30">
                  <button
                    onClick={() => navigate(`/admin/edit/${type}/${media.id}`, { state: { fullMedia: media } })}
                    className="p-2.5 rounded-full bg-blue-600/20 text-blue-500 border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    title="Edit Media"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 rounded-full bg-red-900/40 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white transition-all duration-300"
                    title="Delete Media"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 mt-8 md:mt-16">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-md text-text-main">
              {media.title || media.name}
            </h1>
            
            {media.tagline && (
              <p className="text-xl md:text-2xl text-text-muted italic mb-6 font-light">
                "{media.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base font-medium">
              {media.vote_average !== undefined && media.vote_average > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {Number(media.vote_average).toFixed(1)} <span className="text-yellow-500/50 text-xs ml-1">({media.vote_count})</span>
                </div>
              )}
              
              {(media.release_date || media.first_air_date) && (
                <span className="text-text-muted">
                  {(media.release_date || media.first_air_date)?.substring(0, 4)}
                </span>
              )}
              
              {formatRuntime(media.runtime) && (
                <>
                  <span className="text-text-muted/50">•</span>
                  <span className="text-text-muted">{formatRuntime(media.runtime)}</span>
                </>
              )}

              {media.status && (
                <>
                   <span className="text-text-muted/50">•</span>
                   <span className="text-text-muted">{media.status}</span>
                </>
              )}

              {media.original_language && (
                <>
                  <span className="text-text-muted/50">•</span>
                  <span className="uppercase text-text-muted border border-text-muted/30 px-2 py-0.5 rounded text-xs tracking-widest">
                    {media.original_language}
                  </span>
                </>
              )}
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {media.genres.map((g) => (
                  <span key={g.id} className="bg-btn-bg/10 text-btn-bg border border-btn-bg/30 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-12">
              <h3 className="text-xl font-bold text-text-main mb-4">Overview</h3>
              <p className="text-text-muted text-lg leading-relaxed max-w-4xl">
                {media.overview || 'No overview available.'}
              </p>
            </div>

            {/* Top Cast Grid */}
            {topCast.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-text-main mb-4">Top Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {topCast.map((actor) => (
                    <div key={actor.id} className="bg-card-bg/50 border border-text-muted/10 p-3 rounded-xl text-center shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
                      <p className="text-text-main font-semibold text-sm line-clamp-2">{actor.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-8 border-t border-text-muted/20">
              
              {/* Conditional Director or Creator */}
              {director ? (
                <div>
                  <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Director</h4>
                  <p className="text-text-main font-semibold">{director}</p>
                </div>
              ) : creators ? (
                <div>
                  <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Creator</h4>
                  <p className="text-text-main font-semibold">{creators}</p>
                </div>
              ) : null}

              {/* Conditional Budget/Revenue vs Seasons/Episodes */}
              {mediaData.type === 'tv' || mediaData.number_of_seasons ? (
                <>
                  {(mediaData.number_of_seasons ?? 0) > 0 && (
                    <div>
                      <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Seasons</h4>
                      <p className="text-text-main font-semibold">{mediaData.number_of_seasons}</p>
                    </div>
                  )}
                  {(mediaData.number_of_episodes ?? 0) > 0 && (
                    <div>
                      <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Episodes</h4>
                      <p className="text-text-main font-semibold">{mediaData.number_of_episodes}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {(media.budget ?? 0) > 0 && (
                    <div>
                      <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Budget</h4>
                      <p className="text-text-main font-semibold">{formatCurrency(media.budget)}</p>
                    </div>
                  )}
                  {(media.revenue ?? 0) > 0 && (
                    <div>
                      <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Revenue</h4>
                      <p className="text-text-main font-semibold">{formatCurrency(media.revenue)}</p>
                    </div>
                  )}
                </>
              )}
              
              {media.popularity && (
                <div>
                  <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Popularity</h4>
                  <p className="text-text-main font-semibold">{Number(media.popularity).toFixed(0)}</p>
                </div>
              )}
            </div>

            {/* Production Companies */}
            {mediaData.production_companies && mediaData.production_companies.length > 0 && (
              <div className="pt-8 mt-8 border-t border-text-muted/20">
                <h4 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-3">Production Companies</h4>
                <div className="flex flex-wrap gap-2">
                  {mediaData.production_companies.map((company) => (
                    <span key={company.id} className="text-text-main text-xs bg-text-muted/10 border border-text-muted/20 px-3 py-1.5 rounded-md">
                      {company.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          {/* Modal colors to match theme */}
          <div className="bg-card-bg border border-text-muted/20 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl transform scale-100 transition-all duration-300">
            <h2 className="text-2xl font-bold text-text-main mb-4">Delete Media</h2>
            <p className="text-text-muted mb-8">
              Are you sure you want to delete <span className="font-semibold text-text-main">"{media.title || media.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 rounded-xl font-semibold bg-text-muted/20 text-text-main hover:bg-text-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Details;