import express from 'express';
import { updateProfileController } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../schemas/user.schema';

const router = express.Router();

router.put('/profile', validate(updateProfileSchema), updateProfileController);

export default router;