import { Request, Response, CookieOptions } from 'express';
// Import the FrontendUser interface from the service!
import { registerUser, authenticateUser, refreshUserToken, FrontendUser } from '../services/auth.service';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

const sendAuthResponse = (
  res: Response, 
  statusCode: number, 
  user: FrontendUser, // Safely typed!
  accessToken: string, 
  refreshToken: string
) => {
  res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS });
  res.status(statusCode).json({ user, accessToken });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // If you hover over 'user' here now, it will say 'FrontendUser' instead of 'any'!
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    console.info(`[AUTH] New user registered: ${user.email} (ID: ${user.id})`);
    sendAuthResponse(res, 201, user, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      console.warn(`[AUTH] Registration failed: User already exists (${req.body.email})`);
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    console.error('[AUTH] Server error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // If you hover over 'user' here now, it will say 'FrontendUser'!
    const { user, accessToken, refreshToken } = await authenticateUser(req.body);

    console.info(`[AUTH] User logged in: ${user.email} (ID: ${user.id})`);
    sendAuthResponse(res, 200, user, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      console.warn(`[AUTH] Failed login attempt for email: ${req.body.email}`);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    console.error('[AUTH] Server error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  
  if (!cookies || typeof cookies.jwt !== 'string') {
    console.warn(`[AUTH] Refresh attempted without valid JWT cookie`);
    res.status(401).json({ message: 'Unauthorized - No Refresh Token' });
    return;
  }

  try {
    // If you hover over 'user' here now, it will say 'FrontendUser'!
    const { user, accessToken, refreshToken } = await refreshUserToken(cookies.jwt);
    
    console.info(`[AUTH] Token refreshed for user ID: ${user.id}`);
    sendAuthResponse(res, 200, user, accessToken, refreshToken);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_TOKEN') {
      console.warn(`[AUTH] Refresh failed: Invalid or expired token used`);
      res.status(403).json({ message: 'Forbidden - Token expired or invalid' });
      return;
    }
    console.error('[AUTH] Server error during token refresh:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('jwt', cookieOptions);
  console.info(`[AUTH] User logged out successfully`);
  res.status(200).json({ message: 'Logged out successfully' });
};