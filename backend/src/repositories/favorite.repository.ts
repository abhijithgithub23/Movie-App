import pool from '../config/db';

export const getUserFavoritesDB = async (userId: number) => {
  const query = `
    SELECT 
      m.tmdb_id AS id, 
      m.type AS media_type, 
      m.title, 
      m.original_name AS name, 
      m.poster_path, 
      m.release_date, 
      m.first_air_date, 
      m.vote_average
    FROM user_favorites uf
    JOIN media m ON uf.media_tmdb_id = m.tmdb_id
    WHERE uf.user_id = $1 
    ORDER BY uf.created_at DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const checkFavoriteExistsDB = async (userId: number, tmdbId: number) => {
  const { rows } = await pool.query(
    'SELECT * FROM user_favorites WHERE user_id = $1 AND media_tmdb_id = $2',
    [userId, tmdbId]
  );
  return rows.length > 0;
};

export const removeFavoriteDB = async (userId: number, tmdbId: number) => {
  await pool.query(
    'DELETE FROM user_favorites WHERE user_id = $1 AND media_tmdb_id = $2',
    [userId, tmdbId]
  );
};

export const addFavoriteDB = async (userId: number, tmdbId: number) => {
  await pool.query(
    'INSERT INTO user_favorites (user_id, media_tmdb_id) VALUES ($1, $2)',
    [userId, tmdbId]
  );
};