import { useEffect, useState } from 'react';
import { tmdbApi } from '../api/tmdb';
import type { Media } from '../types';
import MediaCard from '../components/Layout/MediaCard';

const TVShows = () => {
  const [shows, setShows] = useState<Media[]>([]);

  useEffect(() => {
    tmdbApi.get('/discover/tv').then(res => setShows(res.data.results));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Discover TV Shows</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {shows.map(show => <MediaCard key={show.id} media={{...show, media_type: 'tv'}} />)}
      </div>
    </div>
  );
};

export default TVShows;