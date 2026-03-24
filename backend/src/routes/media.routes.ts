import { Router } from 'express';
import { getTrending, getMovies, getTvShows, getMediaDetails } from '../controllers/media.controller';

const router = Router();

router.get('/trending', getTrending);
router.get('/movies', getMovies);
router.get('/tv', getTvShows);

// Dynamic routes go at the bottom!
router.get('/:type/:id', getMediaDetails);

export default router;