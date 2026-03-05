export interface Media {
  id: number | string; // string for custom local ids
  title?: string;
  name?: string; // TMDB uses 'name' for TV shows
  overview: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  isCustom?: boolean; // Flag to identify user-added media
  tagline?: string;   // <-- Add this optional
}

export interface UserState {
  isAdmin: boolean;
}