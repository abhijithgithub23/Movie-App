import { useRef } from "react";
import type { Media } from "../../types";

interface MediaRowProps {
  title: string;
  media: Media[];
}

const MediaRow = ({ title, media }: MediaRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Row title */}
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {/* Scrollable container with arrows */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable row */}
        <div
          ref={rowRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 px-4 md:px-8 scroll-smooth snap-x snap-mandatory"
        >
          {media.map((m) => (
            <div
              key={m.id}
              className="flex-shrink-0 w-40 md:w-48 lg:w-56 snap-start cursor-pointer"
            >
              {/* Fixed height wrapper to prevent jumping */}
              <div className="relative overflow-hidden rounded-lg h-[250px] md:h-[300px] lg:h-[350px] transform transition-transform duration-300 hover:scale-105">
                <img
                  src={
                    m.poster_path
                      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                      : "/placeholder.jpg"
                  }
                  alt={m.title || m.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title below the card */}
              <h3 className="mt-2 text-sm md:text-base truncate">{m.title || m.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaRow;