import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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

  // FIX: Explicitly check if the token exists to satisfy TypeScript
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