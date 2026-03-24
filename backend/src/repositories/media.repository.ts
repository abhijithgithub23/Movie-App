import pool from '../config/db';

export const getTrendingMediaDB = async () => {
  const query = `
    SELECT * FROM media 
    ORDER BY vote_average DESC NULLS LAST 
    LIMIT 20;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Fetch media by type with pagination
export const getMediaByTypeDB = async (type: 'movie' | 'tv', page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM media 
    WHERE media_type = $1 
    ORDER BY vote_average DESC NULLS LAST 
    LIMIT $2 OFFSET $3;
  `;
  
  // Using $1, $2, $3 prevents SQL injection
  const { rows } = await pool.query(query, [type, limit, offset]);
  return rows;
};

// Fetch full details for a specific movie or TV show
export const getMediaDetailsDB = async (type: string, internalId: number) => {
  // This query perfectly matches your logic:
  // It finds the tmdb_id from the 'media' table using the internal ID,
  // then uses that to grab the correct row from 'media_details'
  const query = `
    SELECT * FROM media_details 
    WHERE tmdb_id = (
      SELECT tmdb_id FROM media WHERE id = $1 AND media_type = $2
    )
    AND type = $2;
  `;
  
  const { rows } = await pool.query(query, [internalId, type]);
  
  return rows[0]; 
};