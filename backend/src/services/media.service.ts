import { getTrendingMediaDB, getMediaByTypeDB, getMediaDetailsDB, searchMediaDB } from '../repositories/media.repository';
import * as mediaRepository from '../repositories/media.repository';

export interface MediaInsertDTO {
  type: 'movie' | 'tv';
  title?: string;
  original_name?: string;
  tagline?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_average?: number;
  popularity?: number; // NEW: Added popularity to interface
  original_language?: string;
  genres?: { id: number; name: string }[];
  spoken_languages?: { iso_639_1: string; english_name: string; name: string }[];
}

export const fetchTrendingMedia = async () => {
  const trending = await getTrendingMediaDB();
  return { results: trending }; 
};

export const fetchMovies = async (page: number = 1) => {
  const limit = 20; 
  const movies = await getMediaByTypeDB('movie', page, limit);
  return { results: movies, page, total_pages: 500 }; 
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

export const searchMedia = async (query: string, filters: any) => {
  const results = await searchMediaDB(query, filters);
  return { results }; 
};

export const createMedia = async (mediaData: MediaInsertDTO) => {
  if (!mediaData.type || !mediaData.overview) {
    throw new Error('Type and Overview are strictly required.');
  }
  return await mediaRepository.insertMedia(mediaData);
};