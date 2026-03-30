import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favorites.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Notice we put 'protect' in the middle! This blocks logged-out users.
router.get('/', protect, getFavorites);
router.post('/toggle', protect, toggleFavorite);

export default router;