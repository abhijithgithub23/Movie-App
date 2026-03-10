import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tmdbApi } from '../api/tmdb';
import { deleteMedia } from '../features/media/mediaSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { RootState, AppDispatch } from '../store/store';
import type { Media } from '../types';

const Details = () => {
  const { id: paramId, type: paramType } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth0();
  
  // Replace this with your actual admin email check
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  const id = paramId || '';
  const type = paramType || '';

  // Select all media arrays to properly find custom and fetched items
  const trending = useSelector((state: RootState) => state.media.trending);
  const movies = useSelector((state: RootState) => state.media.movies);
  const tvShows = useSelector((state: RootState) => state.media.tvShows);
  const customMovies = useSelector((state: RootState) => state.media.customMovies);

  // TMDB fallback for full details
  const [tmdbMedia, setTmdbMedia] = useState<Media | null>(null);
  
  // Custom Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find the media item in our existing Redux state
  const reduxMedia: Media | undefined = 
    customMovies.find((m) => String(m.id) === id) ||
    trending.find((m) => String(m.id) === id) ||
    movies.find((m) => String(m.id) === id) ||
    tvShows.find((m) => String(m.id) === id);

  // Final media object: prefer Redux state, fallback to TMDB fetch
  const media: Media | null = reduxMedia ?? tmdbMedia ?? null;

  // Fetch full TMDB data if we don't have full details in Redux
  useEffect(() => {
    if (!id || !type) return;

    const hasFullData = reduxMedia?.genres?.length;

    if (!id.startsWith('custom-') && !hasFullData) {
      let canceled = false;
      tmdbApi
        .get<Media>(`/${type}/${id}`)
        .then((res) => {
          if (!canceled) setTmdbMedia(res.data);
        })
        .catch(() => navigate('/'));
      return () => {
        canceled = true;
      };
    }
  }, [id, type, reduxMedia, navigate]);

  if (!media) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-red-500">
        <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const posterUrl = media.poster_path
    ? media.poster_path.startsWith('http')
      ? media.poster_path
      : `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder.jpg';

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;

  // Helper function to format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Helper function to format runtime
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  };

  // Handle actual deletion
  const confirmDelete = () => {
    // Dispatch ONLY the ID, as expected by PayloadAction<string | number>
    if (media.id) {
      dispatch(deleteMedia(media.id));
      setShowDeleteModal(false);
      navigate('/');
    }
  };

  return (
    <>
      <div className="bg-black min-h-screen text-white pb-20 -mt-20 md:-mt-24">
        
        {/* FULL SCREEN HERO BACKDROP */}
        <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
          {backdropUrl ? (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-red-950/20" />
          )}
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        </div>

        {/* MAIN CONTENT CONTAINER */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-72 md:-mt-96 relative z-10 flex flex-col md:flex-row gap-8 md:gap-16">
          
          {/* LEFT COLUMN: POSTER & ACTIONS */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col items-center">
            <img
              src={posterUrl}
              alt={media.title || media.name}
              className="w-64 md:w-full rounded-2xl shadow-2xl shadow-black border border-gray-800 object-cover"
            />
            
            {/* Action Buttons - FORCED TO CENTER */}
            <div className="w-full mt-6 flex justify-center items-center gap-6">
              
              {/* Instagram-style Heart Button (Dummy for now) */}
              <button
                onClick={() => alert("Favorites feature coming soon!")}
                className="transition-transform duration-300 hover:scale-110 active:scale-90 focus:outline-none"
                title="Add to Favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-white hover:text-gray-300 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>

              {/* Admin Buttons */}
              {isAdmin && (
                <div className="flex justify-center items-center gap-4 border-l pl-6 border-gray-800">
                  {/* Edit Icon Button */}
                  <button
                    onClick={() => navigate(`/admin/edit/${type}/${media.id}`)}
                    className="p-2.5 rounded-full bg-blue-600/20 text-blue-500 border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    title="Edit Media"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  
                  {/* Delete Icon Button */}
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

          {/* RIGHT COLUMN: DETAILS */}
          <div className="flex-1 mt-8 md:mt-16">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-md">
              {media.title || media.name}
            </h1>
            
            {media.tagline && (
              <p className="text-xl md:text-2xl text-gray-400 italic mb-6 font-light">
                "{media.tagline}"
              </p>
            )}

            {/* Quick Stats Row */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base font-medium">
              {media.vote_average !== undefined && media.vote_average > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {media.vote_average.toFixed(1)} <span className="text-yellow-500/50 text-xs ml-1">({media.vote_count})</span>
                </div>
              )}
              
              {(media.release_date || media.first_air_date) && (
                <span className="text-gray-300">
                  {(media.release_date || media.first_air_date)?.substring(0, 4)}
                </span>
              )}
              
              {formatRuntime(media.runtime) && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-300">{formatRuntime(media.runtime)}</span>
                </>
              )}

              {media.status && (
                <>
                   <span className="text-gray-600">•</span>
                   <span className="text-gray-300">{media.status}</span>
                </>
              )}

              {media.original_language && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="uppercase text-gray-300 border border-gray-700 px-2 py-0.5 rounded text-xs tracking-widest">
                    {media.original_language}
                  </span>
                </>
              )}
            </div>

            {/* Genres */}
            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {media.genres.map((g) => (
                  <span key={g.id} className="bg-red-950/40 text-red-200 border border-red-900/50 px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                {media.overview || 'No overview available.'}
              </p>
            </div>

            {/* Extra Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-800">
              {(media.budget ?? 0) > 0 && (
                <div>
                  <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Budget</h4>
                  <p className="text-white font-semibold">{formatCurrency(media.budget)}</p>
                </div>
              )}
              
              {(media.revenue ?? 0) > 0 && (
                <div>
                  <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Revenue</h4>
                  <p className="text-white font-semibold">{formatCurrency(media.revenue)}</p>
                </div>
              )}

              {media.origin_country && media.origin_country.length > 0 && (
                <div>
                  <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Country</h4>
                  <p className="text-white font-semibold">{media.origin_country.join(', ')}</p>
                </div>
              )}

              {media.popularity && (
                <div>
                  <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Popularity Rank</h4>
                  <p className="text-white font-semibold">{media.popularity.toFixed(0)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-red-900/20 transform scale-100 transition-transform">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Media</h2>
            <p className="text-gray-400 mb-8">
              Are you sure you want to delete <span className="font-semibold text-white">"{media.title || media.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 rounded-xl font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
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