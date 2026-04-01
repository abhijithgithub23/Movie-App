import { updateUserProfileDB, getUserByIdDB } from '../repositories/user.repository';
import cloudinary from '../config/cloudinary';

const deleteFromCloudinary = async (url: string) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const filename = parts.pop();
    const folder = parts.pop();
    if (filename && folder) {
      const publicId = `${folder}/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Failed to delete image ${url} from Cloudinary:`, error);
  }
};

export const updateUserProfile = async (userId: number, username: string, profilePic: string | null) => {
  // 1. Get the current user to check their old profile picture
  const currentUser = await getUserByIdDB(userId);
  if (!currentUser) throw new Error('User not found');

  // 2. If they uploaded a NEW profile pic, delete the OLD one from Cloudinary
  if (currentUser.profile_pic && currentUser.profile_pic !== profilePic) {
    await deleteFromCloudinary(currentUser.profile_pic);
  }

  // 3. Update the database
  return await updateUserProfileDB(userId, username, profilePic);
};