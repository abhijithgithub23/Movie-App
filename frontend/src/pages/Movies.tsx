import { useEffect, useState, useMemo, useCallback } from "react"; // Added useCallback
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getMovies } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";
import HeroCarousel from "../components/Media/HeroCarousel";
import LoadingSpinner from "../components/ui/LoadingSpinner";

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
  const { i18n } = useTranslation();

  // console.log("Parent MOVIES page rendered!"); 

  const rawMovies = useSelector((state: RootState) => state.media.movies);
  const status = useSelector((state: RootState) => state.media.status.movies);

  const [page, setPage] = useState(() => {
    const lastLang = sessionStorage.getItem('cv_movies_lang');
    return lastLang === i18n.language ? Math.max(1, Math.ceil(rawMovies.length / 20)) : 1;
  });
  
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [prevLanguage, setPrevLanguage] = useState(i18n.language);
  if (i18n.language !== prevLanguage) {
    setPrevLanguage(i18n.language);
    setPage(1);
  }

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

  useEffect(() => {
    const lastLang = sessionStorage.getItem('cv_movies_lang');
    if (rawMovies.length === 0 || lastLang !== i18n.language) {
      dispatch(getMovies(1));
      sessionStorage.setItem('cv_movies_lang', i18n.language);
    }
  }, [dispatch, i18n.language, rawMovies.length]);

  // Memoize the function so it doesn't break MediaRow's memoization
  const handleLoadMore = useCallback(async () => {
    if (status !== "loading" && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await dispatch(getMovies(nextPage));
      setIsFetchingMore(false);
    }   
  }, [status, isFetchingMore, page, dispatch]);

  if (status === "loading" && page === 1) {
    return <LoadingSpinner />;
  }

  if (!movies.length || !trendingHeroMovies.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main text-text-muted transition-colors duration-300">
        No movies found.
      </div>
    );
  }

  return (
    <div className="bg-main text-text-main min-h-screen pt-2 transition-colors duration-300">
      <HeroCarousel 
        items={trendingHeroMovies} 
        mediaType="movie" 
        badgeText="Top 10 Movies" 
      />

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