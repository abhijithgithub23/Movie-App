export type Media = {
  id: number | string;
  tmdb_id?: number; // Backend requires this
  media_type?: 'movie' | 'tv';
  type?: 'movie' | 'tv'; // Backend uses 'type'
  title?: string;
  name?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  tagline?: string;
  first_air_date?: string;
  release_date?: string;
  vote_average?: number;
  original_language?: string;
  origin_country?: string[];
  adult?: boolean;
  popularity?: number;
  isCustom?: boolean;

  genres?: { id: number; name: string }[]; 
  genre_ids?: number[];

  spoken_languages?: {
    iso_639_1: string;
    english_name: string;
    name: string;
  }[];

  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  budget?: number;
  revenue?: number;
  vote_count?: number;
};

export interface UserState {
  isAdmin: boolean;
}