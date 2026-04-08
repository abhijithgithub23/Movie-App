import { 
  getTrendingMediaDB, getMediaByTypeDB, getMediaDetailsDB, 
  searchMediaDB, insertMedia, updateMediaDB, deleteMediaDB 
} from '../repositories/media.repository';
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
  popularity?: number;
  original_language?: string;
  genres?: { id: number; name: string }[];
  spoken_languages?: { iso_639_1: string; english_name: string; name: string }[];
  
  // Added the missing deep JSON fields here so they pass validation
  credits?: any;
  seasons?: any;
  networks?: any;
  production_companies?: any;
  production_countries?: any;
  created_by?: any;
}

// 1. Map frontend snake_case to database camelCase for INSERTS/UPDATES
const mapDtoToDbModel = (dto: MediaInsertDTO) => ({
  type: dto.type,
  title: dto.title,
  originalName: dto.original_name,
  overview: dto.overview,
  tagline: dto.tagline,
  releaseDate: dto.release_date,
  firstAirDate: dto.first_air_date,
  runtime: dto.runtime,
  numberOfSeasons: dto.number_of_seasons,
  numberOfEpisodes: dto.number_of_episodes,
  voteAverage: dto.vote_average,
  popularity: dto.popularity,
  posterPath: dto.poster_path,
  backdropPath: dto.backdrop_path,
  genres: dto.genres,
  spokenLanguages: dto.spoken_languages,
  
  // Added mapping for inserts/updates
  credits: dto.credits,
  seasons: dto.seasons,
  networks: dto.networks,
  productionCompanies: dto.production_companies,
  productionCountries: dto.production_countries,
  createdBy: dto.created_by,
});

// 2. Map database camelCase back to frontend snake_case for FETCHING
const mapDbModelToFrontendDto = (dbMedia: any) => {
  if (!dbMedia) return dbMedia;
  return {
    ...dbMedia,
    id: dbMedia.tmdbId,             // CRITICAL: Frontend needs tmdbId to be named 'id'
    media_type: dbMedia.type,       // CRITICAL: Frontend needs type to be named 'media_type'
    original_name: dbMedia.originalName,
    name: dbMedia.originalName,     // Some components map 'name' instead of 'original_name'
    poster_path: dbMedia.posterPath,
    backdrop_path: dbMedia.backdropPath,
    release_date: dbMedia.releaseDate,
    first_air_date: dbMedia.firstAirDate,
    vote_average: dbMedia.voteAverage,
    number_of_seasons: dbMedia.numberOfSeasons,
    number_of_episodes: dbMedia.numberOfEpisodes,
    spoken_languages: dbMedia.spokenLanguages,

    credits: dbMedia.credits,
    seasons: dbMedia.seasons,
    networks: dbMedia.networks,
    production_companies: dbMedia.productionCompanies,
    production_countries: dbMedia.productionCountries,
    created_by: dbMedia.createdBy,
  };
};

export const fetchTrendingMedia = async () => {
  const trending = await getTrendingMediaDB();
  return { results: trending.map(mapDbModelToFrontendDto) }; 
};

export const fetchMovies = async (page: number = 1) => {
  const limit = 20; 
  const movies = await getMediaByTypeDB('movie', page, limit);
  return { results: movies.map(mapDbModelToFrontendDto), page, total_pages: 500 }; 
};

export const fetchTvShows = async (page: number = 1) => {
  const limit = 20;
  const tvShows = await getMediaByTypeDB('tv', page, limit);
  return { results: tvShows.map(mapDbModelToFrontendDto), page, total_pages: 500 };
};

export const fetchMediaDetails = async (type: string, tmdbId: number) => {
  const details = await getMediaDetailsDB(type, tmdbId);
  return mapDbModelToFrontendDto(details);
};

export const searchMedia = async (query: string, filters: any) => {
  const results = await searchMediaDB(query, filters);
  return { results: results.map(mapDbModelToFrontendDto) }; 
};

export const createMedia = async (mediaData: MediaInsertDTO) => { 
  const mappedData = mapDtoToDbModel(mediaData);
  const newMedia = await insertMedia(mappedData);
  return mapDbModelToFrontendDto(newMedia);
};

const deleteFromCloudinary = async (url: string) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
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
  const oldMedia = await getMediaDetailsDB(mediaData.type, id);
  if (!oldMedia) throw new Error('Media not found');

  const mappedData = mapDtoToDbModel(mediaData);
  const updatedMedia = await updateMediaDB(id, mappedData);

  if (oldMedia.posterPath && oldMedia.posterPath !== mappedData.posterPath) {
    deleteFromCloudinary(oldMedia.posterPath);
  }
  if (oldMedia.backdropPath && oldMedia.backdropPath !== mappedData.backdropPath) {
    deleteFromCloudinary(oldMedia.backdropPath);
  }

  return mapDbModelToFrontendDto(updatedMedia);
};

export const deleteMediaRecord = async (id: number) => {
  const deletedRecord = await deleteMediaDB(id);
  
  if (deletedRecord) {
    if (deletedRecord.posterPath) await deleteFromCloudinary(deletedRecord.posterPath);
    if (deletedRecord.backdropPath) await deleteFromCloudinary(deletedRecord.backdropPath);
  }
  return deletedRecord;
};