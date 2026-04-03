import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { findUserByIdDB } from '../repositories/auth.repository';

// 1. FAIL-FAST ENV CHECK: Do this once at startup, not on every request.
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment.');
}
const JWT_SECRET = process.env.JWT_SECRET;

// 2. STRICT TYPING: Define exactly what our token payload looks like
interface CustomJwtPayload extends JwtPayload {
  id: number;
}

// Extend Express Request to include our user payload and role
declare global {
  namespace Express {
    interface Request {
      user?: { 
        id: number;
        isAdmin?: boolean; 
      };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    // We intentionally use Bearer tokens here, not cookies, as part of our dual-token strategy.
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    // Log the actual error internally for debugging, but give the client a generic response
    console.warn(` Auth Alert: Token verification failed.`, error);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// 3. COMPOSABLE MIDDLEWARE: A factory function that generates authorization middleware
export const authorizeRole = (requiredRole: 'admin' | 'user') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // 4. CLEANER LOGIC: Use the repository layer instead of writing raw SQL in middleware
      const user = await findUserByIdDB(req.user.id);
      
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const isUserAdmin = user.is_admin === true;

      // Check if they meet the required role
      if (requiredRole === 'admin' && !isUserAdmin) {
        console.warn(` Security Alert: User ${req.user.id} attempted to access an admin route.`);
        res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        return;
      }

      // Attach the role to the request in case downstream controllers need it
      req.user.isAdmin = isUserAdmin;
      
      next(); // Passed all checks!
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};