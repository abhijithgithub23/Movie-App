import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTrending } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const trending = useSelector((state: RootState) => state.media.trending);
  const status = useSelector((state: RootState) => state.media.status.trending);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getTrending());
    }
  }, [status, dispatch]);

  const handleCardClick = (media: typeof trending[0]) => {
    navigate(`/details/${media.media_type || 'movie'}/${media.id}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Trending Now</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {trending.map((media) => (
          <div
            key={media.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer"
            onClick={() => handleCardClick(media)}
          >
            <img
              src={media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/placeholder.jpg'}
              alt={media.title || media.name}
              className="w-full h-auto object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-lg truncate">{media.title || media.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;