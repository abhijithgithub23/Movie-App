import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";

interface MovieData {
  id: string | number;
  title?: string;
  name?: string;
  popularity?: number;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
  [key: string]: unknown; 
}

const Movies = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const rawMovies = useSelector((state: RootState) => state.media.movies);
  const status = useSelector((state: RootState) => state.media.status.movies);

  // NEW: State to track pagination
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const movies = useMemo(
    () => rawMovies.map((m: MovieData) => ({ ...m, media_type: "movie" as const })),
    [rawMovies]
  );

  const trendingHeroMovies = useMemo(
    () =>
      [...movies]
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 10),
    [movies]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = trendingHeroMovies.length;

  useEffect(() => {
    if (status === "idle") {
      dispatch(getMovies(1));
    }
  }, [status, dispatch]);

  // NEW: Load more handler for infinity scrolling
  const handleLoadMore = async () => {
    // Prevent multiple simultaneous fetches
    if (status !== "loading" && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await dispatch(getMovies(nextPage));
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!totalSlides) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  if (!movies.length || !trendingHeroMovies.length) return null;

  const handleHeroClick = (id: string | number) => {
    navigate(`/details/movie/${id}`);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-2">
      <div className="relative h-[80vh] w-full overflow-hidden flex items-center bg-black">
        {trendingHeroMovies.map((item, i) => {
          const isActive = i === activeIndex;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center blur-sm scale-110 opacity-70"
                style={{
                  backgroundImage: item.backdrop_path
                    ? `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`
                    : "none",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

              <div className="relative z-20 w-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 max-w-2xl">
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-full backdrop-blur-sm">
                    Top 10 Movies • #{i + 1}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-2xl">
                    {item.title || item.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-300 font-medium">
                    <span className="flex items-center gap-1 text-yellow-400">
                      ★ {item.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{item.release_date?.substring(0, 4) || "N/A"}</span>
                  </div>

                  <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-md leading-relaxed">
                    {item.overview}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleHeroClick(item.id)}
                      className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 4l15 8-15 8z" />
                      </svg>
                      Watch Trailer
                    </button>
                    <button
                      onClick={() => handleHeroClick(item.id)}
                      className="bg-white/10 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/10"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="hidden md:block w-full max-w-sm flex-shrink-0 perspective-1000">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 transform transition-transform duration-700 hover:scale-105 hover:-rotate-2 cursor-pointer"
                       onClick={() => handleHeroClick(item.id)}>
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || "Movie Poster"}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 md:px-12 py-12 space-y-12 relative z-30 -mt-10">
        {/* NEW: Passed the handleLoadMore to MediaRow */}
        <MediaRow 
           title="Discover Movies" 
           media={movies} 
           onLoadMore={handleLoadMore} 
        />
      </div>
    </div>
  );
};

export default Movies; 