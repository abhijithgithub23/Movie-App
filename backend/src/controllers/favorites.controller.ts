import { Request, Response } from 'express';
import pool from '../config/db';

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // OPTIMIZATION: Only fetch the exact columns required by the MediaCard component.
    // Avoid fetching the heavy JSONB deep data (genres, credits, etc.)
    const result = await pool.query(
      `SELECT 
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
       ORDER BY uf.created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const media = req.body; 
    
    // Make sure we have a clean integer ID to match your media table's tmdb_id column
    // (If your frontend sends 'custom-123', we strip the text out)
    const rawId = String(media.id).replace(/\D/g, ''); 
    const tmdbId = parseInt(rawId, 10);
    
    if (isNaN(tmdbId)) {
      res.status(400).json({ message: 'Invalid media ID' });
      return;
    }

    // 1. Check if the favorite already exists in the junction table
    const checkResult = await pool.query(
      'SELECT * FROM user_favorites WHERE user_id = $1 AND media_tmdb_id = $2',
      [userId, tmdbId]
    );

    if (checkResult.rows.length > 0) {
      // 2. It exists! Delete it from the favorites table.
      await pool.query(
        'DELETE FROM user_favorites WHERE user_id = $1 AND media_tmdb_id = $2',
        [userId, tmdbId]
      );
      res.status(200).json({ message: 'Removed from favorites', added: false, media });
    } else {
      // 3. It doesn't exist! Insert it into the favorites table.
      await pool.query(
        'INSERT INTO user_favorites (user_id, media_tmdb_id) VALUES ($1, $2)',
        [userId, tmdbId]
      );
      res.status(201).json({ message: 'Added to favorites', added: true, media });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
};