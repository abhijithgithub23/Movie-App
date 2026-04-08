import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/db';
import { userFavorites, media } from '../db/schema';

export const getUserFavoritesDB = async (userId: number) => {
  // Drizzle safely performs the INNER JOIN and maps the output keys
  const result = await db
    .select({
      id: media.tmdbId,
      mediaType: media.type,
      title: media.title,
      name: media.originalName,
      posterPath: media.posterPath,
      releaseDate: media.releaseDate,
      firstAirDate: media.firstAirDate,
      voteAverage: media.voteAverage,
    })
    .from(userFavorites)
    .innerJoin(media, eq(userFavorites.mediaTmdbId, media.tmdbId))
    .where(eq(userFavorites.userId, userId))
    .orderBy(desc(userFavorites.createdAt));
    
  return result;
};

export const checkFavoriteExistsDB = async (userId: number, tmdbId: number) => {
  const result = await db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId), 
        eq(userFavorites.mediaTmdbId, tmdbId)
      )
    )
    .limit(1);
    
  return result.length > 0;
};

export const removeFavoriteDB = async (userId: number, tmdbId: number) => {
  await db.delete(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId), 
        eq(userFavorites.mediaTmdbId, tmdbId)
      )
    );
};

export const addFavoriteDB = async (userId: number, tmdbId: number) => {
  await db.insert(userFavorites).values({
    userId,
    mediaTmdbId: tmdbId,
  });
};