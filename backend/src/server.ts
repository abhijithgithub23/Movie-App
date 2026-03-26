import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mediaRoutes from './routes/media.routes';
import { initializeDatabase } from './config/initDb'; // Make sure this path matches where you saved the file!

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/media', mediaRoutes);

// Wrap the startup logic in an async function
const startServer = async () => {
  try {
    // 1. Check/Create database tables FIRST
    console.log('Connecting to database and verifying schema...');
    await initializeDatabase();
    
    // 2. Start the server ONLY if the database is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database initialization error:', error);
    process.exit(1); // Stop the Node process entirely if the DB is broken
  }
};

// Execute the startup sequence
startServer();