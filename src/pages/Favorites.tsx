import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import MediaCard from '../components/Layout/MediaCard';

const Favorites = () => {
  const favorites = useSelector((state: RootState) => state.favorites.items);

  if (favorites.length === 0) {
    return <h2 className="text-2xl text-center text-gray-400 mt-20">You haven't added any favorites yet!</h2>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-red-500">My Favorites</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favorites.map(media => <MediaCard key={media.id} media={media} />)}
      </div>
    </div>
  );
};

export default Favorites;