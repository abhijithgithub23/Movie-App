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

router.post('/',protect, authorizeRole('admin'), validate(addMediaSchema),  addMedia);

router.put('/:id',protect, authorizeRole('admin'), validate(updateMediaSchema), editMediaController);

router.get('/:type/:id', getMediaDetails);
router.delete('/:id', protect, authorizeRole('admin'), validate(mediaIdParamSchema), deleteMediaController);

export default router;