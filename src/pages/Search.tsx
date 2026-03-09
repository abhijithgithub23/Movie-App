import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMediaThunk } from '../features/media/mediaSlice';
import type { RootState, AppDispatch } from '../store/store'; // ✅ Correct store import
import { Link } from 'react-router-dom';

const Search = () => {
  const dispatch = useDispatch<AppDispatch>(); // ✅ Typed dispatch
  const searchResults = useSelector((state: RootState) => state.media.searchResults);
  const [query, setQuery] = useState('');
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => setGenres(data.genres))
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch(searchMediaThunk(query));
    setQuery(''); 
  };

  const filteredResults = selectedGenre
    ? searchResults.filter((m) => m.genres?.some((g) => g.id === selectedGenre))
    : searchResults;

  // console.log('Search results:', searchResults);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* <aside className="w-full md:w-64 bg-gray-800 p-4 rounded-lg h-fit">
        <h3 className="font-bold text-xl mb-4 text-indigo-400">Filter by Genre</h3>
        <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <li
            className={`cursor-pointer px-3 py-2 rounded whitespace-nowrap ${
              selectedGenre === null ? 'bg-indigo-600' : 'hover:bg-gray-700'
            }`}
            onClick={() => setSelectedGenre(null)}
          >
            All Categories
          </li>
          {genres.map((g) => (
            <li
              key={g.id}
              className={`cursor-pointer px-3 py-2 rounded whitespace-nowrap ${
                selectedGenre === g.id ? 'bg-indigo-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => setSelectedGenre(g.id)}
            >
              {g.name}
            </li>
          ))}
        </ul>
      </aside> */}

      <div className="flex-1">
        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="text"
            placeholder="Search movies or TV shows..."
            className="flex-1 p-3 bg-gray-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 px-6 py-3 rounded font-bold hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResults
            .filter((m) => m.media_type === "movie" || m.media_type === "tv")
            .sort((a, b) => {
              const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
              const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
              return dateB - dateA; // latest first
            })
            .map((m) => (
              <Link
                to={`/details/${m.media_type || 'movie'}/${m.id}`}
                key={m.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
              >
                <img
                  src={
                    m.poster_path?.startsWith('http')
                      ? m.poster_path
                      : `https://image.tmdb.org/t/p/w500${m.poster_path}`
                  }
                  alt={m.title || m.name}
                  className="w-full h-auto object-cover"
                />
                <div className="p-4">
                  <h2 className="font-bold truncate">{m.title || m.name}</h2>
                </div>
              </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;