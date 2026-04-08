import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // With @types/multer installed, req.file is strictly typed as Express.Multer.File
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'cinevia', // Cloudinary folder name
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error: unknown) { // CRITICAL FIX: Explicitly set error to 'unknown' instead of 'any'
    console.error('Cloudinary upload error:', error);
    
    // Optional: Extract a safe error message if needed
    let errorMessage = 'Failed to upload image securely';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
};