// src/pages/Search/searchConstants.ts

export const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }, { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
];

export const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export const GENRES = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }, { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" }, { id: 10751, name: "Family" }, { id: 14, name: "Fantasy" },
  { id: 36, name: "History" }, { id: 27, name: "Horror" }, { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" }, { id: 10749, name: "Romance" }, { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" }, { id: 53, name: "Thriller" }, { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

export interface MediaItem {
  id: number;
  media_type?: string;
  poster_path?: string;
  title?: string;
  name?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  original_language?: string;
  genre_ids?: number[];
}

export interface FilterState {
  mediaType: 'all' | 'movie' | 'tv';
  year: string;
  rating: number;
  language: string;
  genre: number | null;
}