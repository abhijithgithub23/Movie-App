import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';
import { protect , admin} from '../middleware/auth.middleware';

const router = Router();

// Use memory storage so we don't clog up your server's hard drive
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit enforced by backend
});

// POST /api/upload - Protected so only logged-in users can upload
router.post('/', protect, admin,  upload.single('image'), uploadImage);

export default router;