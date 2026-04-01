import { getTrendingMediaDB, getMediaByTypeDB, getMediaDetailsDB, searchMediaDB } from '../repositories/media.repository';
import * as mediaRepository from '../repositories/media.repository';
import cloudinary from '../config/cloudinary';


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


// Helper to destroy images in Cloudinary
const deleteFromCloudinary = async (url: string) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    // Extract the folder and filename (e.g., cinevia/image123)
    const parts = url.split('/');
    const filename = parts.pop();
    const folder = parts.pop();
    if (filename && folder) {
      const publicId = `${folder}/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Failed to delete image ${url} from Cloudinary:`, error);
  }
};

export const updateMedia = async (id: number, mediaData: MediaInsertDTO) => {
  // 1. Get the existing media to check if images changed
  const oldMedia = await mediaRepository.getMediaDetailsDB(mediaData.type, id);
  if (!oldMedia) throw new Error('Media not found');

  // 2. If the user uploaded a NEW poster/backdrop, delete the OLD ones from Cloudinary to save space
  if (oldMedia.poster_path && oldMedia.poster_path !== mediaData.poster_path) {
    await deleteFromCloudinary(oldMedia.poster_path);
  }
  if (oldMedia.backdrop_path && oldMedia.backdrop_path !== mediaData.backdrop_path) {
    await deleteFromCloudinary(oldMedia.backdrop_path);
  }

  // 3. Update the database
  return await mediaRepository.updateMediaDB(id, mediaData);
};

export const deleteMediaRecord = async (id: number) => {
  // 1. Delete from Postgres and get the image URLs back
  const deletedRecord = await mediaRepository.deleteMediaDB(id);
  
  if (deletedRecord) {
    // 2. Erase the images from Cloudinary!
    if (deletedRecord.poster_path) await deleteFromCloudinary(deletedRecord.poster_path);
    if (deletedRecord.backdrop_path) await deleteFromCloudinary(deletedRecord.backdrop_path);
  }
  return deletedRecord;
};