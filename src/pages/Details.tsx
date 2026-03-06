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

    if (!id.startsWith('custom') && !trending.find(m => String(m.id) === id)) {
      let canceled = false;
      tmdbApi.get<Media>(`/${type}/${id}`)
        .then(res => {
          if (!canceled) setTmdbMedia(res.data);
        })
        .catch(() => navigate('/'));
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

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;

  const isFavorite = favorites.some(item => String(item.id) === id);

  return (
    <div className="relative text-white min-h-screen">
      {backdropUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
      )}

      <div className="max-w-5xl mx-auto pt-24 pb-12 px-4 md:flex bg-gray-800 bg-opacity-80 rounded-xl shadow-2xl backdrop-blur-md">
        <img
          src={posterUrl}
          alt={media.title || media.name}
          className="w-full md:w-1/3 object-cover md:rounded-l-xl mb-6 md:mb-0"
        />

        <div className="md:ml-8 flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{media.title || media.name}</h1>
          {media.tagline && <p className="text-gray-300 italic text-lg">{media.tagline}</p>}

          <p className="text-lg leading-relaxed">{media.overview}</p>

          {media.genres && (
            <p><strong>Genres:</strong> {media.genres.map(g => g.name).join(', ')}</p>
          )}

          {(media.release_date || media.first_air_date) && (
            <p><strong>Release Date:</strong> {media.release_date || media.first_air_date}</p>
          )}

          {media.original_language && (
            <p><strong>Language:</strong> {media.original_language.toUpperCase()}</p>
          )}

          {media.origin_country && media.origin_country.length > 0 && (
            <p><strong>Country:</strong> {media.origin_country.join(', ')}</p>
          )}

          {media.popularity && <p><strong>Popularity:</strong> {media.popularity}</p>}
          {media.vote_average !== undefined && (
            <p><strong>Vote:</strong> {media.vote_average} ({media.vote_count} votes)</p>
          )}

          <div className="flex gap-4 flex-wrap mt-4">
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
                  onClick={() => navigate(`/admin/edit/${type}/${media.id}`)}
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
    </div>
  );
};

export default Details;
