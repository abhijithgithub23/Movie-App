import { Router } from 'express';
import { getTrending, getMovies, getTvShows, getMediaDetails, searchMediaController, addMedia } from '../controllers/media.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/trending', getTrending);
router.get('/movies', getMovies);
router.get('/tv', getTvShows);

// Search MUST go before the dynamic /:type/:id route
router.get('/search', searchMediaController);

router.get('/:type/:id', getMediaDetails);

router.post('/', protect, addMedia);

export default router;