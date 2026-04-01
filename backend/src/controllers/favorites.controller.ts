import { Request, Response } from 'express';
import { fetchUserFavorites, toggleUserFavorite } from '../services/favorite.service';

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const favorites = await fetchUserFavorites(userId);
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await toggleUserFavorite(userId, req.body);
    res.status(result.added ? 201 : 200).json(result);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    if (error instanceof Error && error.message === 'INVALID_ID') {
      res.status(400).json({ message: 'Invalid media ID' });
      return;
    }
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
};