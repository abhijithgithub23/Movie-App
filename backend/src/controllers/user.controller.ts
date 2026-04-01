import { Request, Response } from 'express';
import { updateUserProfile } from '../services/user.service';

export const updateProfileController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Assuming you send the user ID in the body or grab it from req.user if you have auth middleware
    const { id, username, profile_pic } = req.body;

    if (!id || !username) {
      res.status(400).json({ message: 'User ID and username are required.' });
      return;
    }

    const updatedUser = await updateUserProfile(id, username, profile_pic);
    
    // Exclude password_hash before sending back to frontend!
    const { password_hash, ...safeUser } = updatedUser;
    
    res.status(200).json(safeUser);
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    let errorMessage = 'Server error updating profile';
    if (error instanceof Error) errorMessage = error.message;
    res.status(500).json({ message: errorMessage });
  }
};