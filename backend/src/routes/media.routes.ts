import { Router } from 'express';
import { getTrending, getMovies, getTvShows, getMediaDetails, searchMediaController } from '../controllers/media.controller';

const router = Router();

router.get('/trending', getTrending);
router.get('/movies', getMovies);
router.get('/tv', getTvShows);

// Search MUST go before the dynamic /:type/:id route
router.get('/search', searchMediaController);

router.get('/:type/:id', getMediaDetails);

export default router;