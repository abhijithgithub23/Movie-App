import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    id: z.number({ message: 'User ID is required' }),
    username: z.string().trim().min(1, 'Username is required'),
    // Allows valid URL, null, or empty string if they remove their picture
    profile_pic: z.string().trim().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  })
});