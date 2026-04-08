import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller';
import { protect , authorizeRole} from '../middleware/auth.middleware';

const router = Router();

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit enforced by backend
});

router.post('/', protect, authorizeRole('admin'),  upload.single('image'), uploadImage);

export default router;