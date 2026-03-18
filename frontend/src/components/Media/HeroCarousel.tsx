import { useState, useEffect , memo} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface HeroMediaItem {
  id: string | number;
  title?: string;
  name?: string;
  popularity?: number;
  backdrop_path?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

interface HeroCarouselProps {
  items: HeroMediaItem[];
  mediaType: "movie" | "tv";
  badgeText: string;
}

const HeroCarousel = ({ items, mediaType, badgeText }: HeroCarouselProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSlides = items.length;

  useEffect(() => {
    if (!totalSlides) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleHeroClick = (id: string | number) => {
    navigate(`/details/${mediaType}/${id}`);
  };

  if (!items.length) return null;

  
  

  return (
    <div className="relative h-[80vh] w-full overflow-hidden flex items-center bg-main">
      {items.map((item, i) => {
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
                  {badgeText} • #{i + 1}
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-2xl text-white">
                  {item.title || item.name}
                </h1>

                <div className="flex items-center gap-4 mb-6 text-sm text-text-muted font-medium drop-shadow-md">
                  <span className="flex items-center gap-1 text-yellow-400">
                    ★ {item.vote_average?.toFixed(1) || "N/A"}
                  </span>
                  <span>•</span>
                  <span>
                    {(item.release_date || item.first_air_date)?.substring(0, 4) || "N/A"}
                  </span>
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
                    {t("watchTrailer")}
                  </button>

                  <button
                    onClick={() => handleHeroClick(item.id)}
                    className="bg-card-bg/60 text-text-main font-semibold px-8 py-3 rounded-full hover:bg-card-bg transition-all duration-300 backdrop-blur-md border border-text-muted/30"
                  >
                    {t("details")}
                  </button>
                </div>
              </div>

              <div className="hidden md:block w-full max-w-sm flex-shrink-0 perspective-1000">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl shadow-main/80 border border-text-muted/20 transform transition-transform duration-700 hover:scale-105 hover:-rotate-2 cursor-pointer"
                  onClick={() => handleHeroClick(item.id)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name || "Poster"}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// This tells React exactly WHEN it is allowed to re-render the HeroCarousel
export default memo(HeroCarousel, (prevProps, nextProps) => {
  // If the media type changes, allow re-render
  if (prevProps.mediaType !== nextProps.mediaType) return false;
  
  // Create simple arrays of just the IDs
  const prevIds = prevProps.items.map(item => item.id).join(',');
  const nextIds = nextProps.items.map(item => item.id).join(',');
  
  // If the string of IDs is identical, return TRUE (meaning: "Do NOT re-render")
  // If the IDs are different, return FALSE (meaning: "Go ahead and re-render")
  return prevIds === nextIds;
});