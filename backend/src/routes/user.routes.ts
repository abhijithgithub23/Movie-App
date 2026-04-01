import express from 'express';
import { updateProfileController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// PUT /api/user/profile
// router.put('/profile', protect, updateProfileController); <-- Use this if you have a protect middleware!
router.put('/profile',protect,  updateProfileController);

export default router;