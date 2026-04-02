import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    // Matches VARCHAR(50)
    username: z.string().trim()
      .min(1, 'Username is required')
      .max(50, 'Username cannot exceed 50 characters'),
      
    // Matches VARCHAR(100)
    email: z.string().trim()
      .email('Invalid email address')
      .max(100, 'Email cannot exceed 100 characters'),
      
    // Prevents insanely long password payloads that can DDOS your server via bcrypt overload
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(255, 'Password cannot exceed 255 characters'),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});