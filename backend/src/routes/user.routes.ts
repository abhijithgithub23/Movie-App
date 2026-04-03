import express from 'express';
import { updateProfileController } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../schemas/user.schema';
import { protect } from '../middleware/auth.middleware';


const router = express.Router();

router.put('/profile', protect, validate(updateProfileSchema), updateProfileController);

export default router;