import pool from '../config/db';

export const getTrendingMediaDB = async () => {
  // OPTIMIZED: Only fetching the exact columns needed for Home/Hero/MediaRow
  const query = `
    SELECT 
      tmdb_id AS id, 
      type AS media_type, 
      title, 
      original_name AS name, 
      backdrop_path, 
      poster_path, 
      overview, 
      vote_average 
    FROM media 
    ORDER BY vote_average DESC NULLS LAST 
    LIMIT 20;
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
      vote_average 
    FROM media 
    WHERE type = $1 
    ORDER BY vote_average DESC NULLS LAST 
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
  return rows[0]; 
};

export const searchMediaDB = async (searchTerm: string) => {
  const query = `
    SELECT 
      m.*, 
      m.tmdb_id AS id,
      m.type AS media_type,
      COALESCE(json_agg(mg.genre_id) FILTER (WHERE mg.genre_id IS NOT NULL), '[]') AS genre_ids
    FROM media m
    LEFT JOIN media_genres mg ON m.tmdb_id = mg.media_tmdb_id
    WHERE m.title ILIKE $1 OR m.original_name ILIKE $1
    GROUP BY m.id
    ORDER BY m.vote_average DESC NULLS LAST
    LIMIT 20;
  `;
  
  const { rows } = await pool.query(query, [`%${searchTerm}%`]);
  return rows;
};