import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret123', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET || 'refreshSecret123', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Admin logic & Database Insert
    const isAdmin = email === 'abhijithksd23@gmail.com';
    
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_admin) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, is_admin, profile_pic`,
      [username, email, passwordHash, isAdmin]
    );

    const user = newUser.rows[0];
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 4. Send Refresh Token in HTTP-Only Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Don't send the password hash back!
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, accessToken });
  } catch (error) {
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

  jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refreshSecret123', async (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden - Invalid Refresh Token' });

    // Generate new access token
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '15m' });
    res.json({ accessToken });
  });
};

export const logout = (req: Request, res: Response): void => {
  // We tell the browser to instantly destroy the refresh token cookie
  res.clearCookie('jwt', { 
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV === 'production' 
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};