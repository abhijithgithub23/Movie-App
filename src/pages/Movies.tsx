import { useEffect, useState } from 'react';
import { tmdbApi } from '../api/tmdb';
import type { Media } from '../types';
import MediaCard from '../components/Layout/MediaCard';

const Movies = () => {
  const [movies, setMovies] = useState<Media[]>([]);

  useEffect(() => {
    tmdbApi.get('/discover/movie').then(res => setMovies(res.data.results));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Discover Movies</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map(movie => <MediaCard key={movie.id} media={{...movie, media_type: 'movie'}} />)}
      </div>
    </div>
  );
};

export default Movies;