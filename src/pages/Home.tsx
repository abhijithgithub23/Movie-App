import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTrending } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  const trending = useSelector((state: RootState) => state.media.trending);
  const status = useSelector((state: RootState) => state.media.status.trending);

  // We split the index into two states: one for the background, one for the text
  const [bgIndex, setBgIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    if (status === "idle") dispatch(getTrending());
  }, [status, dispatch]);

  // Hero slide rotation
  useEffect(() => {
    if (!trending.length) return;

    const interval = setInterval(() => {
      setBgIndex((prevBg) => {
        const nextIndex = (prevBg + 1) % Math.min(trending.length, 6);

        // 1. Immediately start fading out the text as the slide begins
        setTextVisible(false);

        // 2. Halfway through the slide (500ms), the text is invisible. Swap the text data now.
        setTimeout(() => {
          setTextIndex(nextIndex);
        }, 500);

        // 3. When the slide finishes (1000ms), start fading the new text back in
        setTimeout(() => {
          setTextVisible(true);
        }, 1000);

        return nextIndex; // This triggers the background slide instantly
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [trending]);

  if (!trending.length) return null;

  // Background uses bgIndex, Text uses textIndex
  const textHero = trending[textIndex];
  
  const movies = trending.filter((m) => m.media_type === "movie");
  const tv = trending.filter((m) => m.media_type === "tv");
  const highRated = trending.filter((m) => (m.vote_average ?? 0) > 7);
  const totalSlides = Math.min(trending.length, 6);

  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO SECTION */}
      <div className="relative h-[75vh] overflow-hidden">

        {/* Infinite Sliding Backgrounds */}
        {trending.slice(0, 6).map((item, i) => {
          let position = "100%";

          if (i === bgIndex) {
            position = "0%";
          } else if (i === (bgIndex - 1 + totalSlides) % totalSlides) {
            position = "-100%";
          }

          const isSnapping = i === (bgIndex - 2 + totalSlides) % totalSlides;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 bg-cover bg-center transition-transform ${
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

        {/* HERO TEXT CONTAINER */}
        <div
          className={`absolute bottom-16 left-8 md:left-12 max-w-2xl transition-opacity ease-in-out z-20 ${
            textVisible 
              ? "opacity-100 duration-1000" // Fades in smoothly over 1s once slide stops
              : "opacity-0 duration-500"    // Fades out quickly over 0.5s as slide moves
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {textHero.title || textHero.name}
          </h1>

          <p className="text-gray-300 mb-6 line-clamp-3 drop-shadow-md">
            {textHero.overview}
          </p>

          <div className="flex gap-4">
            <button className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-300 transition-colors">
              ▶ Play
            </button>

            <button className="bg-gray-700/80 text-white px-6 py-2 rounded font-semibold hover:bg-gray-600 transition-colors backdrop-blur-sm">
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