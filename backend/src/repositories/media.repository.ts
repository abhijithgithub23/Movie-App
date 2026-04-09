import { eq, and, or, ilike, desc, sql, gte, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import { media, mediaGenres } from '../db/schema';

export const getTrendingMediaDB = async () => {
  const [movies, tvShows] = await Promise.all([
    db.select().from(media).where(eq(media.type, 'movie')).orderBy(desc(media.popularity)).limit(20),
    db.select().from(media).where(eq(media.type, 'tv')).orderBy(desc(media.popularity)).limit(20)
  ]);

  return [...movies, ...tvShows].sort((a, b) => Number(b.popularity) - Number(a.popularity));
};

export const getMediaByTypeDB = async (type: 'movie' | 'tv', page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  return await db
    .select()
    .from(media)
    .where(eq(media.type, type))
    .orderBy(desc(media.popularity))
    .limit(limit)
    .offset(offset);
};

export const getMediaDetailsDB = async (type: string, tmdbId: number) => {
  const result = await db
    .select()
    .from(media)
    .where(and(eq(media.tmdbId, tmdbId), eq(media.type, type)))
    .limit(1);
    
  return result[0]; 
};

// Extracted reusable dictionary mapping
const getRelatedGenreIds = (genreId: number): number[] => {
  const genreMap: Record<number, number[]> = {
    28: [28, 10759], 12: [12, 10759], 10759: [10759, 28, 12], 
    878: [878, 10765], 14: [14, 10765], 10765: [10765, 878, 14],
    10752: [10752, 10768], 10768: [10768, 10752],
    10751: [10751, 10762], 10762: [10762, 10751],
  };
  return genreMap[genreId] || [genreId];
};

export const searchMediaDB = async (
  searchTerm: string, 
  filters: { mediaType?: string; year?: string; rating?: number; language?: string; genre?: number }
) => {
  // 1. Initialize dynamic conditions array with the search term
  const conditions = [
    or(ilike(media.title, `%${searchTerm}%`), ilike(media.originalName, `%${searchTerm}%`))
  ];

  // 2. Conditionally push filters safely
  if (filters.mediaType && filters.mediaType !== 'all') {
    conditions.push(eq(media.type, filters.mediaType));
  }

  if (filters.year && filters.year !== 'all') {
    conditions.push(sql`to_char(${media.releaseDate}, 'YYYY') = ${filters.year} OR to_char(${media.firstAirDate}, 'YYYY') = ${filters.year}`);
  }

  if (filters.rating && filters.rating > 0) {
    conditions.push(gte(media.voteAverage, filters.rating.toString())); // numeric is mapped to string in PG
  }

  if (filters.language && filters.language !== 'all') {
    // Drizzle safely handles raw JSONB operators via sql template tags
    conditions.push(sql`${media.spokenLanguages} @> ${JSON.stringify([{ iso_639_1: filters.language }])}::jsonb`);
  }

  if (filters.genre) {
    const targetGenres = getRelatedGenreIds(filters.genre);
    
    
    conditions.push(
      inArray(
        media.tmdbId,
        db.select({ id: mediaGenres.mediaTmdbId })
          .from(mediaGenres)
          .where(inArray(mediaGenres.genreId, targetGenres))
      )
    );
  }

  return await db
    .select()
    .from(media)
    .where(and(...conditions))
    .orderBy(desc(sql`COALESCE(${media.releaseDate}, ${media.firstAirDate})`));
};

export const insertMedia = async (mediaData: any) => {
  // Generate synthetic ID safely using Drizzle SQL operators
  const nextIdRes = await db
    .select({ nextId: sql<number>`COALESCE(MAX(${media.tmdbId}), 1000000) + 1` })
    .from(media);
    
  // Safely fallback if table is completely empty
  const syntheticTmdbId = nextIdRes[0]?.nextId ?? 1000001;

  const result = await db.insert(media).values({
    tmdbId: syntheticTmdbId,
    type: mediaData.type || 'movie',
    title: mediaData.title || null,
    originalName: mediaData.originalName || null,
    overview: mediaData.overview || null,
    tagline: mediaData.tagline || null,
    releaseDate: mediaData.releaseDate || null,
    firstAirDate: mediaData.firstAirDate || null,
    runtime: mediaData.runtime || null,
    numberOfSeasons: mediaData.numberOfSeasons || null,
    numberOfEpisodes: mediaData.numberOfEpisodes || null,
    voteAverage: mediaData.voteAverage?.toString() || '0', 
    popularity: mediaData.popularity?.toString() || '0',
    posterPath: mediaData.posterPath || null,
    backdropPath: mediaData.backdropPath || null,
    genres: mediaData.genres || null,
    spokenLanguages: mediaData.spokenLanguages || null,
    
    credits: mediaData.credits || null,
    seasons: mediaData.seasons || null,
    networks: mediaData.networks || null,
    productionCompanies: mediaData.productionCompanies || null,
    productionCountries: mediaData.productionCountries || null,
    createdBy: mediaData.createdBy || null,
  }).returning();

  return result[0];
};

export const updateMediaDB = async (tmdbId: number, mediaData: any) => {
  const result = await db.update(media)
    .set({
      title: mediaData.title || null,
      originalName: mediaData.originalName || null,
      overview: mediaData.overview || null,
      tagline: mediaData.tagline || null,
      releaseDate: mediaData.releaseDate || null,
      firstAirDate: mediaData.firstAirDate || null,
      runtime: mediaData.runtime || null,
      voteAverage: mediaData.voteAverage?.toString() || '0',
      popularity: mediaData.popularity?.toString() || '0',
      posterPath: mediaData.posterPath || null,
      backdropPath: mediaData.backdropPath || null,
      genres: mediaData.genres || null,
      spokenLanguages: mediaData.spokenLanguages || null,
      numberOfSeasons: mediaData.numberOfSeasons || null,
      numberOfEpisodes: mediaData.numberOfEpisodes || null,
      
      credits: mediaData.credits || null,
      seasons: mediaData.seasons || null,
      networks: mediaData.networks || null,
      productionCompanies: mediaData.productionCompanies || null,
      productionCountries: mediaData.productionCountries || null,
      createdBy: mediaData.createdBy || null,

      updatedAt: new Date(), 
    })
    .where(eq(media.tmdbId, tmdbId))
    .returning();

  return result[0];
};

export const deleteMediaDB = async (tmdbId: number) => {
  const result = await db.delete(media)
    .where(eq(media.tmdbId, tmdbId))
    .returning({ posterPath: media.posterPath, backdropPath: media.backdropPath });
    
  return result[0]; 
};