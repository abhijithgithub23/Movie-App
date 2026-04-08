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
  if (currentUser.profilePic && currentUser.profilePic !== profilePic) {
    await deleteFromCloudinary(currentUser.profilePic);
  }

  // 3. Update the database
  const updatedUser = await updateUserProfileDB(userId, username, profilePic);

  if (!updatedUser) return updatedUser;

  // 4. Map Drizzle's camelCase back to the frontend's expected snake_case
  return {
    ...updatedUser,
    profile_pic: updatedUser.profilePic, // CRITICAL: Fixes the broken image!
    is_admin: updatedUser.isAdmin,       // CRITICAL: Keeps admin privileges working
    created_at: updatedUser.createdAt
  };
};