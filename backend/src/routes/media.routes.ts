import express from 'express';
import { 
  getTrending, 
  getMovies, 
  getTvShows, 
  getMediaDetails, 
  searchMediaController, 
  addMedia, 
  editMediaController, 
  deleteMediaController 
} from '../controllers/media.controller';
import { validate } from '../middleware/validate.middleware';
import { protect, authorizeRole } from '../middleware/auth.middleware';

import { 
  addMediaSchema, 
  updateMediaSchema, 
  mediaIdParamSchema, 
  searchQuerySchema 
} from '../schemas/media.schema';


const router = express.Router();

router.get('/trending', getTrending);
router.get('/movies', getMovies);
router.get('/tv', getTvShows);

router.get('/search', validate(searchQuerySchema), searchMediaController);

router.post('/', validate(addMediaSchema), protect, authorizeRole('admin'), addMedia);

router.put('/:id', validate(updateMediaSchema),protect, authorizeRole('admin'), editMediaController);

router.get('/:type/:id', validate(mediaIdParamSchema), getMediaDetails);
router.delete('/:id', validate(mediaIdParamSchema), protect, authorizeRole('admin'), deleteMediaController);

export default router;