export type Media = {
   id: number | string;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  tagline?: string;
  first_air_date?: string;
  release_date?: string;
  genres?: { id: number; name: string }[];
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
  origin_country?: string[];
  adult?: boolean;
  popularity?: number;
  isCustom?: boolean;

};

export interface UserState {
  isAdmin: boolean;
}