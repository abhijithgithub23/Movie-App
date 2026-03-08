import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { Media } from '../types';
import MediaCard from '../components/Media/MediaCard';

const Favorites = () => {
  const favorites = useSelector((state: RootState) => state.favorites.items) as Media[];

  if (favorites.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-2xl text-center text-gray-400">
          You haven't added any favorites yet!
        </h2>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-red-500">My Favorites</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favorites.map((media) => (
          <MediaCard key={media.id} media={{ ...media, media_type: media.media_type || 'movie' }} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;