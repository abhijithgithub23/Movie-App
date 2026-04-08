import { 
  getUserFavoritesDB, 
  checkFavoriteExistsDB, 
  addFavoriteDB, 
  removeFavoriteDB 
} from '../repositories/favorite.repository';

export const fetchUserFavorites = async (userId: number) => {
  const favorites = await getUserFavoritesDB(userId);
  
  // Map Drizzle's camelCase return back to the frontend's expected snake_case
  return favorites.map(fav => ({
    ...fav,
    media_type: fav.mediaType,
    original_name: fav.name,
    poster_path: fav.posterPath,
    release_date: fav.releaseDate,
    first_air_date: fav.firstAirDate,
    vote_average: fav.voteAverage,
  }));
};

export const toggleUserFavorite = async (userId: number, media: any) => {
  // Since we fixed media.service, media.id is correctly the TMDB ID again!
  const rawId = String(media.id).replace(/\D/g, ''); 
  const tmdbId = parseInt(rawId, 10);
  
  if (isNaN(tmdbId)) {
    throw new Error('INVALID_ID');
  }

  const exists = await checkFavoriteExistsDB(userId, tmdbId);

  if (exists) {
    await removeFavoriteDB(userId, tmdbId);
    return { message: 'Removed from favorites', added: false, media };
  } else {
    await addFavoriteDB(userId, tmdbId);
    return { message: 'Added to favorites', added: true, media };
  }
};