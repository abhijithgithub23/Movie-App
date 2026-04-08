import { Request, Response } from 'express';
import { updateUserProfile } from '../services/user.service';

export const updateProfileController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // CRITICAL FIX: The frontend sends 'profile_pic', so we must map it to 'profilePic' here
    const { username, profile_pic: profilePic } = req.body;
    
    const updatedUser = await updateUserProfile(userId, username, profilePic);

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found or update failed' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('[USER] Error updating profile:', error);
    
    let errorMessage = 'Server error updating profile';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
};