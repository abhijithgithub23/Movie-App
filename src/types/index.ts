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
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
  origin_country?: string[];
  adult?: boolean;
  popularity?: number;
  isCustom?: boolean;

  genres?: { id: number; name: string }[]; // Keep this for the details page
  genre_ids?: number[];

};

export interface UserState {
  isAdmin: boolean;
}