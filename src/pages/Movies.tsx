import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMovies } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import MediaCard from '../components/Media/MediaCard';

const Movies = () => {
  const dispatch = useDispatch<AppDispatch>(); 
  const movies = useSelector((state: RootState) => state.media.movies);
  const status = useSelector((state: RootState) => state.media.status.movies);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getMovies());
    }
  }, [dispatch, status]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Discover Movies</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MediaCard key={movie.id} media={{ ...movie, media_type: 'movie' }} />
        ))}
      </div>
    </div>
  );
};

export default Movies;