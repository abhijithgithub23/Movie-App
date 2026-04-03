import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../config/db'; // Import your database pool to check admin status

// Extend Express Request to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Explicitly check if the token exists to satisfy TypeScript
  if (!token) {
    res.status(401).json({ message: 'Not authorized, malformed token' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    
    // Now TypeScript knows for a fact that both 'token' and 'secret' are strings
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Safely assign the ID to the request
    if (decoded && decoded.id) {
      req.user = { id: decoded.id as number };
      next();
    } else {
      res.status(401).json({ message: 'Not authorized, invalid token payload' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Ensure the protect middleware actually ran first and attached the user ID
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Not authorized, user ID missing' });
      return;
    }

    // 2. Query the database to get the absolute latest admin status
    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = rows[0];

    // 3. Check the flag
    if (user.is_admin) {
      next(); // VIP Access Granted! Pass to the controller.
    } else {
      // 403 Forbidden: The server understands the request, but refuses to authorize it.
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error checking admin status' });
  }
};