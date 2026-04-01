import { v2 as cloudinary } from 'cloudinary';

// We use 'as string' to satisfy TypeScript's strict null checks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export default cloudinary;