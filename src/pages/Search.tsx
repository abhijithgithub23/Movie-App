import { useState, useEffect } from 'react';
import { tmdbApi, searchMedia } from '../api/tmdb';
import type { Media } from '../types';
import { Link } from 'react-router-dom';

// Temporary type for raw TMDB API search results
type TmdbResult = {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  popularity?: number;
};

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Media[]>([]);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // Fetch movie genres on mount
  useEffect(() => {
    tmdbApi.get('/genre/movie/list')
      .then(res => setGenres(res.data.genres))
      .catch(err => console.error('Error fetching genres:', err));
  }, []);

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await searchMedia(query);

      // Map TMDB results to your Media type
      const mappedResults: Media[] = res.data.results.map((m: TmdbResult) => ({
        ...m,
        id: m.id,
        genres: m.genre_ids?.map(id => ({ id, name: '' })) || [],
      }));

      setResults(mappedResults);
    } catch (err) {
      console.error('Error fetching search results:', err);
    }
  };

  // Filter results by selected genre
  const filteredResults = selectedGenre
    ? results.filter(m => m.genres?.some(g => g.id === selectedGenre))
    : results;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 p-4 rounded-lg h-fit">
        <h3 className="font-bold text-xl mb-4 text-indigo-400">Filter by Genre</h3>
        <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <li
            className={`cursor-pointer px-3 py-2 rounded whitespace-nowrap ${selectedGenre === null ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            onClick={() => setSelectedGenre(null)}
          >
            All Categories
          </li>
          {genres.map(g => (
            <li
              key={g.id}
              className={`cursor-pointer px-3 py-2 rounded whitespace-nowrap ${selectedGenre === g.id ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
              onClick={() => setSelectedGenre(g.id)}
            >
              {g.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="text"
            placeholder="Search movies or TV shows..."
            className="flex-1 p-3 bg-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 px-6 py-3 rounded font-bold hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResults.map(media => (
            <Link
              to={`/details/${media.media_type || 'movie'}/${media.id}`}
              key={media.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
            >
              <img
                src={
                  media.poster_path
                    ? media.poster_path.startsWith('http')
                      ? media.poster_path
                      : `https://image.tmdb.org/t/p/w500${media.poster_path}`
                    : '/placeholder.jpg'
                }
                alt={media.title || media.name}
                className="w-full h-auto object-cover"
              />
              <div className="p-4">
                <h2 className="font-bold truncate">{media.title || media.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;