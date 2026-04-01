import { Router } from 'express';
import { getTrending, getMovies, getTvShows, getMediaDetails, searchMediaController, addMedia, editMediaController, deleteMediaController } from '../controllers/media.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/trending', getTrending);
router.get('/movies', getMovies);
router.get('/tv', getTvShows);

// Search MUST go before the dynamic /:type/:id route
router.get('/search', searchMediaController);

router.get('/:type/:id', getMediaDetails);

router.post('/', protect, addMedia);

router.put('/:id', editMediaController);
router.delete('/:id', deleteMediaController);

export default router;