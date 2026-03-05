import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTrending, deleteMedia } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import { useAuth0 } from '@auth0/auth0-react';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trending, status } = useSelector((state: RootState) => state.media);
  const { user } = useAuth0();
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getTrending());
    }
  }, [status, dispatch]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Trending Now</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {trending.map((media) => (
          <div key={media.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform">
            <img 
              src={media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/placeholder.jpg'} 
              alt={media.title || media.name} 
              className="w-full h-auto object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-lg truncate">{media.title || media.name}</h2>
              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button className="text-xs bg-blue-600 px-3 py-1 rounded">Edit</button>
                  <button 
                    onClick={() => dispatch(deleteMedia(media.id))}
                    className="text-xs bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;