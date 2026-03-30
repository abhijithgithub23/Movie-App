import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';


export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('Missing required environment variables');
}

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET , { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET , { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Standardized cookie options for reuse
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict' as const,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const isAdmin = email === 'abhijithksd23@gmail.com';
    
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_admin) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, is_admin, profile_pic`,
      [username, email, passwordHash, isAdmin]
    );

    const user = newUser.rows[0];
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set Refresh Token in HTTP-Only Cookie
    res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    // Send User and Access Token in the JSON response
    res.status(201).json({ user, accessToken });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set Refresh Token in HTTP-Only Cookie
    res.cookie('jwt', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Send User and Access Token in the JSON response (excluding password hash)
    const { password_hash, ...userWithoutSensitiveData } = user;
    res.status(200).json({ user: userWithoutSensitiveData, accessToken });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.status(401).json({ message: 'Unauthorized - No Refresh Token' });
    return;
  }

  const refreshToken = cookies.jwt;

  // console.log("🟡 OLD REFRESH TOKEN:", refreshToken);

  jwt.verify(refreshToken, REFRESH_SECRET, async (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ message: 'Forbidden - Token expired or invalid' });
      return;
    }

    try {
      const result = await pool.query(
        'SELECT id, username, email, is_admin, profile_pic FROM users WHERE id = $1', 
        [decoded.id]
      );
      
      const user = result.rows[0];
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Generate BOTH new access and refresh tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

      // console.log("🟢 NEW REFRESH TOKEN:", newRefreshToken);

      
      // Update the cookie with the new refresh token (Token Rotation)
      res.cookie('jwt', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  
      // Send BOTH the user data and the new token back to rebuild the Redux state
      res.json({ user, accessToken });
    } catch (dbError) {
      console.error('Database error during refresh:', dbError);
      res.status(500).json({ message: 'Server error during token refresh' });
    }
  });
};

export const logout = (req: Request, res: Response): void => {
  // Clear the cookie from the browser
  res.clearCookie('jwt', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};