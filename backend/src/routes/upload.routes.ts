import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Use memory storage so we don't clog up your server's hard drive
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit enforced by backend
});

// POST /api/upload - Protected so only logged-in users can upload
router.post('/', protect, upload.single('image'), uploadImage);

export default router;