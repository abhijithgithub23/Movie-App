import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 
import { getTrending } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";
// import { useTheme } from "../context/ThemeContext"; 

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { i18n } = useTranslation(); 

  const trending = useSelector((state: RootState) => state.media.trending);
  const status = useSelector((state: RootState) => state.media.status.trending);

  const [bgIndex, setBgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  // const { theme } = useTheme();
  
  const prevLangRef = useRef(i18n.language);

  useEffect(() => {
    const isLangChange = prevLangRef.current !== i18n.language;
    
    // Only fetch if we have no data OR the language has changed
    if (trending.length === 0 || isLangChange) {
      dispatch(getTrending());
      prevLangRef.current = i18n.language;
    }
  }, [dispatch, i18n.language, trending.length]);
 
  useEffect(() => {
    if (!trending.length) return;

    const interval = setInterval(() => {
      setBgIndex((prevBg) => {
        const nextIndex = (prevBg + 1) % Math.min(trending.length, 10);
        setTextVisible(false);
        setTimeout(() => {
          setTextIndex(nextIndex);
        }, 500);
        setTimeout(() => {
          setTextVisible(true);
        }, 1000);
        return nextIndex;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [trending]);

  if (status === "loading" || !trending.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main pt-2">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600"></div>
      </div>
    );
  }

  const textHero = trending[textIndex];
  
  const handleHeroClick = () => {
    const type = textHero.media_type || (textHero.title ? "movie" : "tv");
    navigate(`/details/${type}/${textHero.id}`);
  };

  const movies = trending.filter((m) => m.media_type === "movie");
  const tv = trending.filter((m) => m.media_type === "tv");
  const highRated = trending.filter((m) => (m.vote_average ?? 0) > 7);
  const totalSlides = Math.min(trending.length, 10);

  return (
    <div className="bg-main text-text-main min-h-screen pt-2 transition-colors duration-300">
      {/* HERO SECTION */}
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

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

        {/* HERO TEXT CONTAINER */}
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

      {/* CONTENT ROWS */}
      <div className="px-6 md:px-12 py-12 space-y-12 relative z-20">
        <MediaRow title="Trending Now" media={trending} />
        <MediaRow title="Popular Movies" media={movies} />
        <MediaRow title="Popular TV Shows" media={tv} />
        <MediaRow title="Top Rated" media={highRated} />
      </div>
    </div>
  );
};

export default Home;