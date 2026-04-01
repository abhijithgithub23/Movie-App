import { Request, Response } from 'express';
import { registerUser, authenticateUser, refreshUserToken } from '../services/auth.service';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict' as const,
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS });
    res.status(201).json({ user, accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await authenticateUser(req.body);

    res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS });
    res.status(200).json({ user, accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.status(401).json({ message: 'Unauthorized - No Refresh Token' });
    return;
  }

  try {
    const { user, accessToken, refreshToken } = await refreshUserToken(cookies.jwt);
    
    res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS });
    res.json({ user, accessToken });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_TOKEN') {
      res.status(403).json({ message: 'Forbidden - Token expired or invalid' });
      return;
    }
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('jwt', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};