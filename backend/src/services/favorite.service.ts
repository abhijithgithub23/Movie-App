import { 
  getUserFavoritesDB, 
  checkFavoriteExistsDB, 
  addFavoriteDB, 
  removeFavoriteDB 
} from '../repositories/favorite.repository';

export const fetchUserFavorites = async (userId: number) => {
  return await getUserFavoritesDB(userId);
};

export const toggleUserFavorite = async (userId: number, media: any) => {
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