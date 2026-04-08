import { Request, Response } from 'express';
import { fetchUserFavorites, toggleUserFavorite } from '../services/favorite.service';

// 1. Define the shape of the media object the frontend sends to toggle a favorite
export interface ToggleFavoriteBody {
  id: number | string;
  // We use an index signature here because the frontend might send the whole 
  // media object, but our backend service primarily just needs the 'id'.
  [key: string]: unknown; 
}

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: req.user is populated by your auth middleware
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const favorites = await fetchUserFavorites(userId);
    res.status(200).json(favorites);
  } catch (error: unknown) { // 2. Explicitly type error as unknown
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

// 3. Pass the interface into the Request generic (Params, ResBody, ReqBody)
export const toggleFavorite = async (
  req: Request<unknown, unknown, ToggleFavoriteBody>, 
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Because of the generic above, req.body is safely typed as ToggleFavoriteBody
    const result = await toggleUserFavorite(userId, req.body);
    res.status(result.added ? 201 : 200).json(result);
  } catch (error: unknown) { // Explicitly type error as unknown
    console.error('Error toggling favorite:', error);
    if (error instanceof Error && error.message === 'INVALID_ID') {
      res.status(400).json({ message: 'Invalid media ID' });
      return;
    }
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
};