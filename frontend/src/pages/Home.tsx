import { useEffect, useState, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTrending } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Module-level variable to track the language of the currently fetched Redux data
let lastFetchedTrendingLang = "";

// --- TYPES ---
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  overview?: string;
  media_type?: "movie" | "tv";
  vote_average?: number;
}

interface ContentRowsProps {
  trending: MediaItem[];
  movies: MediaItem[];
  tv: MediaItem[];
  highRated: MediaItem[];
}

// --- SUB-COMPONENT: HERO SECTION ---
const HeroSection = memo(({ trending }: { trending: MediaItem[] }) => {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  
  const totalSlides = Math.min(trending.length, 10);

  useEffect(() => {
    if (!trending.length) return;

    const interval = setInterval(() => {
      setBgIndex((prevBg) => {
        const nextIndex = (prevBg + 1) % totalSlides;
        setTextVisible(false);
        setTimeout(() => setTextIndex(nextIndex), 500);
        setTimeout(() => setTextVisible(true), 1000);
        return nextIndex;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [trending.length, totalSlides]);

  const textHero = trending[textIndex];
  if (!textHero) return null;

  const handleHeroClick = () => {
    const type = textHero.media_type || (textHero.title ? "movie" : "tv");
    navigate(`/details/${type}/${textHero.id}`);
  };

  return (
    <div className="relative h-[75vh] overflow-hidden">
      {trending.slice(0, 10).map((item, i) => {
        let position = "100%";
        if (i === bgIndex) position = "0%";
        else if (i === (bgIndex - 1 + totalSlides) % totalSlides) position = "-100%";

        const isSnapping = i === (bgIndex - 2 + totalSlides) % totalSlides;

        return (
          <div
            key={item.id}
            className={`absolute inset-0 bg-cover bg-top transition-transform ${
              isSnapping ? "duration-0" : "duration-1000 ease-in-out"
            }`}
            style={{
              backgroundImage: item.backdrop_path
                ? `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`
                : "none",
              transform: `translateX(${position})`,
            }}
          />
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent z-10" />
      
      <div
        className={`absolute bottom-16 left-8 md:left-12 max-w-2xl transition-opacity ease-in-out z-20 ${
          textVisible ? "opacity-100 duration-1000" : "opacity-0 duration-500"
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg text-white">
          {textHero.title || textHero.name}
        </h1>
        <p className="text-gray-200 mb-6 line-clamp-3 drop-shadow-md">
          {textHero.overview}
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleHeroClick}
            className="flex items-center gap-2 bg-btn-bg/90 text-btn-text font-medium px-6 py-2 rounded-md shadow-sm hover:bg-btn-bg transition-colors duration-300"
          >
            <svg className="w-4 h-4 text-btn-text fill-current" viewBox="0 0 24 24">
              <path d="M6 4l15 8-15 8z" />
            </svg>
            Play
          </button>
          <button
            onClick={handleHeroClick}
            className="bg-card-bg/80 text-text-main border border-text-muted/30 px-6 py-3 rounded-lg font-semibold hover:bg-card-bg transition-colors backdrop-blur-sm"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  );
});

// --- SUB-COMPONENT: CONTENT ROWS ---
const ContentRows = memo(({ trending, movies, tv, highRated }: ContentRowsProps) => {
  return (
    <div className="px-6 md:px-12 py-12 space-y-12 relative z-20">
      <MediaRow title="Trending Now" media={trending} />
      <MediaRow title="Popular Movies" media={movies} />
      <MediaRow title="Popular TV Shows" media={tv} />
      <MediaRow title="Top Rated" media={highRated} />
    </div>
  );
});

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();

  const trending = useSelector((state: RootState) => state.media.trending) as MediaItem[];
  const status = useSelector((state: RootState) => state.media.status.trending);

  useEffect(() => {
    if (trending.length === 0 || lastFetchedTrendingLang !== i18n.language) {
      dispatch(getTrending());
      lastFetchedTrendingLang = i18n.language; // Update JS memory instead of sessionStorage
    }
  }, [dispatch, i18n.language, trending.length]);

  const filteredData = useMemo(() => ({
    movies: trending.filter((m) => m.media_type === "movie"),
    tv: trending.filter((m) => m.media_type === "tv"),
    highRated: trending.filter((m) => (m.vote_average ?? 0) > 7),
  }), [trending]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!trending.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main text-text-muted transition-colors duration-300">
        No trending media found.
      </div>
    );
  }

  return (
    <div className="bg-main text-text-main min-h-screen pt-2 transition-colors duration-300">
      <HeroSection trending={trending} />
      <ContentRows 
        trending={trending} 
        movies={filteredData.movies} 
        tv={filteredData.tv} 
        highRated={filteredData.highRated} 
      />
    </div>
  );
};
   
export default Home;