import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMovies } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";
// import { useTheme } from "../context/ThemeContext";

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
  const { i18n } = useTranslation();
  // const { theme } = useTheme();

  const rawMovies = useSelector((state: RootState) => state.media.movies);
  const status = useSelector((state: RootState) => state.media.status.movies);

  // Initialize page dynamically based on cached items (20 items per TMDB page)
  const [page, setPage] = useState(() => Math.max(1, Math.ceil(rawMovies.length / 20)));
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // 1. Render-phase state update (Safe from ESLint warnings)
  const [prevLanguage, setPrevLanguage] = useState(i18n.language);
  if (i18n.language !== prevLanguage) {
    setPrevLanguage(i18n.language);
    setPage(1);
  }

  // 2. Ref to track the last fetched language for the API call
  const fetchedLangRef = useRef(i18n.language);

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
    const isLangChange = fetchedLangRef.current !== i18n.language;

    // 3. ONLY perform side effects here
    if (rawMovies.length === 0 || isLangChange) {
      dispatch(getMovies(1));
      fetchedLangRef.current = i18n.language;
    }
  }, [dispatch, i18n.language, rawMovies.length]);

  // Load more handler for infinity scrolling
  const handleLoadMore = async () => {
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

  if (status === "loading" && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600"></div>
      </div>
    );
  }

  if (!movies.length || !trendingHeroMovies.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main text-text-muted transition-colors duration-300">
        No movies found.
      </div>
    );
  }

  const handleHeroClick = (id: string | number) => {
    navigate(`/details/movie/${id}`);
  };

  return (
    <div className="bg-main text-text-main min-h-screen pt-2 transition-colors duration-300">
      <div className="relative h-[80vh] w-full overflow-hidden flex items-center bg-main">
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
              
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

              <div className="relative z-20 w-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 max-w-2xl">
                  <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-text-main uppercase bg-text-muted/10 border border-text-muted/20 rounded-full backdrop-blur-sm">
                    Top 10 Movies • #{i + 1}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-2xl text-white">
                    {item.title || item.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm text-text-muted font-medium drop-shadow-md">
                    <span className="flex items-center gap-1 text-yellow-400">
                      ★ {item.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{item.release_date?.substring(0, 4) || "N/A"}</span>
                  </div>

                  <p className="text-gray-200 text-lg mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-lg leading-relaxed font-medium">
                    {item.overview}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleHeroClick(item.id)}
                      className="flex items-center gap-2 bg-btn-bg text-btn-text font-semibold px-8 py-3 rounded-full shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 4l15 8-15 8z" />
                      </svg>
                      Watch Trailer
                    </button>
                    <button
                      onClick={() => handleHeroClick(item.id)}
                      className="bg-card-bg/60 text-text-main font-semibold px-8 py-3 rounded-full hover:bg-card-bg transition-all duration-300 backdrop-blur-md border border-text-muted/30"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="hidden md:block w-full max-w-sm flex-shrink-0 perspective-1000">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-main/80 border border-text-muted/20 transform transition-transform duration-700 hover:scale-105 hover:-rotate-2 cursor-pointer"
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