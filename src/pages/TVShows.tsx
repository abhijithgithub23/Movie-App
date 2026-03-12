import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getTVShows } from "../features/media/mediaSlice";
import type { RootState, AppDispatch } from "../store/store";
import MediaRow from "../components/Media/MediaRow";
import HeroCarousel from "../components/Media/HeroCarousel";

const TVShows = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();

  const rawShows = useSelector((state: RootState) => state.media.tvShows);
  const status = useSelector((state: RootState) => state.media.status.tvShows);

  const [page, setPage] = useState(() => {
    const lastLang = sessionStorage.getItem('cv_tv_lang');
    return lastLang === i18n.language ? Math.max(1, Math.ceil(rawShows.length / 20)) : 1;
  });
  
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const [prevLanguage, setPrevLanguage] = useState(i18n.language);
  if (i18n.language !== prevLanguage) {
    setPrevLanguage(i18n.language);
    setPage(1);
  }

  const shows = useMemo(
    () => rawShows.map((s) => ({ ...s, media_type: "tv" as const })),
    [rawShows]
  );

  const trendingHeroShows = useMemo(
    () =>
      [...shows]
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 10), 
    [shows]
  );

  useEffect(() => {
    const lastLang = sessionStorage.getItem('cv_tv_lang');
    if (rawShows.length === 0 || lastLang !== i18n.language) {
      dispatch(getTVShows(1));
      sessionStorage.setItem('cv_tv_lang', i18n.language);
    }
  }, [dispatch, i18n.language, rawShows.length]);

  const handleLoadMore = async () => {
    if (status !== "loading" && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await dispatch(getTVShows(nextPage));
      setIsFetchingMore(false);
    }
  };

  if (status === "loading" && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600"></div>
      </div>
    );
  }

  if (!shows.length || !trendingHeroShows.length) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-main text-text-muted transition-colors duration-300">
        No TV shows found.
      </div>
    );
  }

  return (
    <div className="bg-main text-text-main min-h-screen pt-2 transition-colors duration-300">
      <HeroCarousel 
        items={trendingHeroShows} 
        mediaType="tv" 
        badgeText="Top 10 TV Shows" 
      />

      <div className="px-6 md:px-12 py-12 space-y-12 relative z-30 -mt-10">
        <MediaRow 
          title="Discover TV Shows" 
          media={shows} 
          onLoadMore={handleLoadMore} 
        />
      </div>
    </div>
  );
};

export default TVShows;