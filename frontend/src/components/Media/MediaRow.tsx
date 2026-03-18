import { useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import type { Media } from "../../types";


interface MediaRowProps {
  title: string;
  media: Media[];
  onLoadMore?: () => void;
}

const MediaRow = ({ title, media, onLoadMore }: MediaRowProps) => {

  const rowRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Helper function to handle any type of image URL
  const getPosterUrl = (path?: string) => {
    if (!path) return "/placeholder.jpg";
    
    // Check if it's already a full web link, a base64 string, or a local blob
    if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
      return path;
    }
    
    // Ensure TMDB paths have a leading slash just in case
    const tmdbPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/w500${tmdbPath}`;
  };

  const savedOnLoadMore = useRef(onLoadMore);
  useEffect(() => {
    savedOnLoadMore.current = onLoadMore;
  }, [onLoadMore]);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    
    const { clientWidth } = rowRef.current;
    
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleNavigation = (item: Media) => {
    const type = item.media_type || (item.title ? "movie" : "tv");
    navigate(`/details/${type}/${item.id}`);
  };
  

  useEffect(() => {
    if (!rowRef.current || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && savedOnLoadMore.current) {
          savedOnLoadMore.current();
        }
      },
      { 
        root: rowRef.current, 
        rootMargin: "0px 200px 0px 0px", 
        threshold: 0 
      } 
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold mb-4 mt-8">{title}</h2>

      <div className="relative group/row">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref={rowRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 px-4 md:px-8 scroll-smooth snap-x snap-mandatory ml-5"
        >
          {media.map((m) => (
            <div
              key={m.id}
              onClick={() => handleNavigation(m)}
              className="group flex-shrink-0 w-40 md:w-48 lg:w-56 snap-start cursor-pointer m-2"
            >
              {/* Image Wrapper */}
              <div className="relative overflow-hidden rounded-lg h-[250px] md:h-[300px] lg:h-[350px] transform transition-transform duration-300 hover:scale-105">
                <img
                  src={getPosterUrl(m.poster_path)}
                  alt={m.title || m.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="mt-6 text-sm md:text-base text-center truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                {m.title || m.name}
              </h3>
            </div>
          ))}
          
          <div ref={observerTarget} className="w-10 h-full flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default memo(MediaRow);