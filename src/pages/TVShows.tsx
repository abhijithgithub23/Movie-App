import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTVShows } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store';
import MediaCard from '../components/Media/MediaCard';

const TVShows = () => {
  const dispatch = useDispatch<AppDispatch>();
  const shows = useSelector((state: RootState) => state.media.tvShows);
  const status = useSelector((state: RootState) => state.media.status.tvShows);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getTVShows());
    }
  }, [dispatch, status]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Discover TV Shows</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {shows.map((show) => (
          <MediaCard key={show.id} media={{ ...show, media_type: 'tv' }} />
        ))}
      </div>
    </div>
  );
};

export default TVShows;