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

// Validate Queries
router.get('/search', validate(searchQuerySchema), searchMediaController);

// Validate Body
router.post('/', validate(addMediaSchema), addMedia);

// Validate Params AND Body
router.put('/:id', validate(updateMediaSchema), editMediaController);

// Validate Params
router.get('/:type/:id', validate(mediaIdParamSchema), getMediaDetails);
router.delete('/:id', validate(mediaIdParamSchema), deleteMediaController);

export default router;