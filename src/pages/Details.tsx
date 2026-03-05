import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tmdbApi } from '../api/tmdb';
import { toggleFavorite } from '../features/favorites/favoritesSlice';
import type { RootState } from '../store/store';
import type { Media } from '../types';

const Details = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const dispatch = useDispatch();

  // ✅ Proper slice access
  const favorites = useSelector((state: RootState) => state.favorites.items) as Media[];
  const isFavorite = favorites.some((item: Media) => String(item.id) === id);

  useEffect(() => {
    if (!id) return;

    if (!id.toString().startsWith('custom')) {
      tmdbApi.get<Media>(`/${type}/${id}`).then(res => setMedia(res.data));
    } else {
      const customItem = favorites.find((item: Media) => String(item.id) === id);
      if (customItem) setMedia(customItem);
    }
  }, [id, type, favorites]);

  if (!media) {
    return <div className="text-white flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      <img
        src={media.poster_path.startsWith('http') ? media.poster_path : `https://image.tmdb.org/t/p/w500${media.poster_path}`}
        alt={media.title || media.name}
        className="w-full md:w-1/3 object-cover"
      />
      <div className="p-8 flex-1">
        <h1 className="text-4xl font-bold mb-4">{media.title || media.name}</h1>
        {media.tagline && <p className="text-gray-400 mb-6 italic">{media.tagline}</p>}
        <p className="text-lg leading-relaxed mb-8">{media.overview}</p>

        <button
          onClick={() => dispatch(toggleFavorite({ ...media, media_type: type as 'movie' | 'tv' }))}
          className={`px-6 py-3 rounded font-bold shadow-lg transition ${
            isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default Details;