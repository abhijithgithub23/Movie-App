import { Request, Response } from 'express';
import { updateUserProfile } from '../services/user.service';

// 1. Define the exact shape we expect the frontend to send
export interface UpdateProfileBody {
  username: string;
  profile_pic: string | null;
}

// 2. Pass the interface into the Request generic (Params, ResBody, ReqBody)
export const updateProfileController = async (
  req: Request<unknown, unknown, UpdateProfileBody>, 
  res: Response
): Promise<void> => {
  try {
    // Note: req.user is populated by your auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Because of the generic above, req.body is no longer 'any'.
    // 'username' is strictly a string, and 'profilePic' is string | null!
    const { username, profile_pic: profilePic } = req.body;
    
    const updatedUser = await updateUserProfile(userId, username, profilePic);

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found or update failed' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error: unknown) { // 3. Explicitly mark error as 'unknown' instead of 'any'
    console.error('[USER] Error updating profile:', error);
    
    let errorMessage = 'Server error updating profile';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
};