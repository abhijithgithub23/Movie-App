import { getTrendingMediaDB, getMediaByTypeDB, getMediaDetailsDB, searchMediaDB } from '../repositories/media.repository';

export const fetchTrendingMedia = async () => {
  const trending = await getTrendingMediaDB();
  // Return in a structure similar to TMDB so your frontend doesn't break
  return { results: trending }; 
};

export const fetchMovies = async (page: number = 1) => {
  const limit = 20; // 20 items per page
  const movies = await getMediaByTypeDB('movie', page, limit);
  return { results: movies, page, total_pages: 500 }; // Added total_pages just in case your frontend needs it
};

export const fetchTvShows = async (page: number = 1) => {
  const limit = 20;
  const tvShows = await getMediaByTypeDB('tv', page, limit);
  return { results: tvShows, page, total_pages: 500 };
};

export const fetchMediaDetails = async (type: string, tmdbId: number) => {
  const details = await getMediaDetailsDB(type, tmdbId);
  return details;
};

export const searchMedia = async (query: string) => {
  const results = await searchMediaDB(query);
  return { results }; 
};