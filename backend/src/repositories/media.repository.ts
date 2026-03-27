import pool from '../config/db';

export const getTrendingMediaDB = async () => {
  const query = `
    WITH TrendingMovies AS (
      SELECT 
        tmdb_id AS id, 
        type AS media_type, 
        title, 
        original_name AS name, 
        backdrop_path, 
        poster_path, 
        overview, 
        vote_average,
        popularity -- Added this so the final query can sort by it
      FROM media 
      WHERE type = 'movie' 
      ORDER BY popularity DESC NULLS LAST 
      LIMIT 20
    ),
    TrendingTVShows AS (
      SELECT 
        tmdb_id AS id, 
        type AS media_type, 
        title, 
        original_name AS name, 
        backdrop_path, 
        poster_path, 
        overview, 
        vote_average,
        popularity -- Added this so the final query can sort by it
      FROM media 
      WHERE type = 'tv' 
      ORDER BY popularity DESC NULLS LAST 
      LIMIT 20
    ),
    CombinedTrending AS (
      SELECT * FROM TrendingMovies
      UNION ALL
      SELECT * FROM TrendingTVShows
    )
    -- Sort the combined 40 items together by overall popularity
    SELECT * FROM CombinedTrending
    ORDER BY popularity DESC NULLS LAST;
  `;
  
  const { rows } = await pool.query(query);
  return rows;
};



export const getMediaByTypeDB = async (type: 'movie' | 'tv', page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  // OPTIMIZED: The Movies/TV pages also just need basic card info
  const query = `
    SELECT 
      tmdb_id AS id, 
      type AS media_type, 
      title, 
      original_name AS name, 
      backdrop_path, 
      poster_path, 
      overview, 
      vote_average,
      popularity -- Added popularity to the select just in case the frontend needs it later
    FROM media 
    WHERE type = $1 
    -- CHANGED: Now sorting by popularity so the best/most relevant media shows up on Page 1!
    ORDER BY popularity DESC NULLS LAST 
    LIMIT $2 OFFSET $3;
  `;
  
  const { rows } = await pool.query(query, [type, limit, offset]);
  return rows;
};


export const getMediaDetailsDB = async (type: string, tmdbId: number) => {
  // Direct lookup! No more messy subqueries!
  const query = `
    SELECT *, tmdb_id AS id, type AS media_type 
    FROM media 
    WHERE tmdb_id = $1 AND type = $2;
  `;
  const { rows } = await pool.query(query, [tmdbId, type]);
  // console.log(rows);

  return rows[0]; 
};


// Define the TMDB Genre Mapping Dictionary outside the function so it's reusable
const getRelatedGenreIds = (genreId: number): number[] => {
  const genreMap: Record<number, number[]> = {
    // Action (28) / Adventure (12) -> TV Action & Adventure (10759)
    28: [28, 10759],
    12: [12, 10759],
    10759: [10759, 28, 12], 
    
    // Sci-Fi (878) / Fantasy (14) -> TV Sci-Fi & Fantasy (10765)
    878: [878, 10765],
    14: [14, 10765],
    10765: [10765, 878, 14],
    
    // War (10752) -> TV War & Politics (10768)
    10752: [10752, 10768],
    10768: [10768, 10752],

    // Family (10751) -> TV Kids (10762)
    10751: [10751, 10762],
    10762: [10762, 10751],
  };

  // If the genre is in the map, return the expanded array. Otherwise, just return the original ID.
  return genreMap[genreId] || [genreId];
};

export const searchMediaDB = async (
  searchTerm: string, 
  filters: { mediaType?: string; year?: string; rating?: number; language?: string; genre?: number }
) => {
  const values: any[] = [`%${searchTerm}%`];
  let paramIndex = 2; 

  let queryText = `
    SELECT 
      m.tmdb_id AS id,
      m.type AS media_type,
      m.title,
      m.original_name AS name,
      m.poster_path,
      m.vote_average,
      m.release_date,
      m.first_air_date,
      m.spoken_languages->0->>'iso_639_1' AS original_language,
      COALESCE(json_agg(mg.genre_id) FILTER (WHERE mg.genre_id IS NOT NULL), '[]') AS genre_ids
    FROM media m
    LEFT JOIN media_genres mg ON m.tmdb_id = mg.media_tmdb_id
    WHERE (m.title ILIKE $1 OR m.original_name ILIKE $1)
  `;

  if (filters.mediaType && filters.mediaType !== 'all') {
    queryText += ` AND m.type = $${paramIndex}`;
    values.push(filters.mediaType);
    paramIndex++;
  }

  if (filters.year && filters.year !== 'all') {
    queryText += ` AND (to_char(m.release_date, 'YYYY') = $${paramIndex} OR to_char(m.first_air_date, 'YYYY') = $${paramIndex})`;
    values.push(filters.year);
    paramIndex++;
  }

  if (filters.rating && filters.rating > 0) {
    queryText += ` AND m.vote_average >= $${paramIndex}`;
    values.push(filters.rating);
    paramIndex++;
  }

  if (filters.language && filters.language !== 'all') {
    queryText += ` AND m.spoken_languages @> $${paramIndex}::jsonb`;
    values.push(JSON.stringify([{ iso_639_1: filters.language }]));
    paramIndex++;
  }

  if (filters.genre) {
    // FIX: Use the mapping dictionary to automatically grab all related IDs
    const targetGenres = getRelatedGenreIds(filters.genre);
    
    queryText += ` AND EXISTS (
      SELECT 1 FROM media_genres mg2 
      WHERE mg2.media_tmdb_id = m.tmdb_id AND mg2.genre_id = ANY($${paramIndex}::int[])
    )`;
    values.push(targetGenres);
    paramIndex++;
  }

  queryText += `
    GROUP BY m.id
    ORDER BY COALESCE(m.release_date, m.first_air_date) DESC NULLS LAST
  `;

  const { rows } = await pool.query(queryText, values);
  return rows;
};