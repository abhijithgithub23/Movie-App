import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import mediaRoutes from './routes/media.routes';
import authRoutes from './routes/auth.routes';
import favoritesRoutes from './routes/favorites.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE & SECURITY
// ==========================================

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', limiter); 

app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50kb' })); 


// ==========================================
// 2. API ROUTES
// ==========================================
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/favorites', favoritesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);


// ==========================================
// 3. FALLBACK HANDLERS
// ==========================================

// 404 Catch-All Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(' Global Error:', err.stack || err);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;