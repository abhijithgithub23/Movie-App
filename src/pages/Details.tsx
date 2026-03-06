import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tmdbApi } from '../api/tmdb';
import { toggleFavorite } from '../features/favorites/favoritesSlice';
import { deleteMedia } from '../features/media/mediaSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { RootState } from '../store/store';
import type { Media } from '../types';

const Details = () => {
  const { id: paramId, type: paramType } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth0();
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  const id = paramId || '';
  const type = paramType || '';

  const favorites = useSelector((state: RootState) => state.favorites.items) as Media[];
  const trending = useSelector((state: RootState) => state.media.trending) as Media[];

  const [tmdbMedia, setTmdbMedia] = useState<Media | null>(null);

  // Combine Redux + TMDB
  const media = useMemo<Media | null>(() => {
    if (!id) return null;
    const custom = favorites.find(m => String(m.id) === id);
    const reduxTrending = trending.find(m => String(m.id) === id);
    return custom || reduxTrending || tmdbMedia;
  }, [id, favorites, trending, tmdbMedia]);

  useEffect(() => {
    if (!id || !type) return;

    // Only fetch TMDB if not a custom/local Redux item
    if (!id.startsWith('custom') && !trending.find(m => String(m.id) === id)) {
      let canceled = false;
      tmdbApi.get<Media>(`/${type}/${id}`).then(res => {
        if (!canceled) setTmdbMedia(res.data);
      }).catch(() => navigate('/'));
      return () => { canceled = true; };
    }
  }, [id, type, trending, navigate]);

  if (!media) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const posterUrl = media.poster_path
    ? media.poster_path.startsWith('http')
      ? media.poster_path
      : `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder.jpg';

  const isFavorite = favorites.some(item => String(item.id) === id);

  return (
    <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      <img
        src={posterUrl}
        alt={media.title || media.name}
        className="w-full md:w-1/3 object-cover"
      />
      <div className="p-8 flex-1">
        <h1 className="text-4xl font-bold mb-4">{media.title || media.name}</h1>
        {media.tagline && <p className="text-gray-400 mb-6 italic">{media.tagline}</p>}
        <p className="text-lg leading-relaxed mb-8">{media.overview}</p>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() =>
              dispatch(toggleFavorite({ ...media, media_type: media.media_type || (type as 'movie' | 'tv') }))
            }
            className={`px-6 py-3 rounded font-bold shadow-lg transition ${
              isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() =>navigate(`/admin/edit/${type}/${media.id}`)}
                className="px-6 py-3 rounded font-bold shadow-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  dispatch(deleteMedia(media.id));
                  navigate('/');
                }}
                className="px-6 py-3 rounded font-bold shadow-lg bg-red-600 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;