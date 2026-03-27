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
  // console.log(rows);
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
  // console.log(rows);

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
      -- Safely extract the first language code from the JSONB array to send to the frontend
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
    // The @> operator checks if the JSONB array contains this exact object structure
    queryText += ` AND m.spoken_languages @> $${paramIndex}::jsonb`;
    // We stringify the exact JSON structure we are looking for in the database
    values.push(JSON.stringify([{ iso_639_1: filters.language }]));
    paramIndex++;
  }

  if (filters.genre) {
    queryText += ` AND EXISTS (SELECT 1 FROM media_genres mg2 WHERE mg2.media_tmdb_id = m.tmdb_id AND mg2.genre_id = $${paramIndex})`;
    values.push(filters.genre);
    paramIndex++;
  }

  queryText += `
    GROUP BY m.id
    ORDER BY COALESCE(m.release_date, m.first_air_date) DESC NULLS LAST
    
  `;

  const { rows } = await pool.query(queryText, values);
  return rows;
};