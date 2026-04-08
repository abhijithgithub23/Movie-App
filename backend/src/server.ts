import dotenv from 'dotenv';
dotenv.config(); 

import app from './app';
import { initializeDatabase } from './config/initDb';
import pool from './config/db'; 

const PORT = process.env.PORT || 5000;
let server: any;

const startServer = async () => {
  try {
    console.log('Connecting to database and verifying schema...');
    await initializeDatabase();
    
    server = app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Failed to start server due to database initialization error:', error);
    process.exit(1); 
  }
};

startServer();

// SHUTDOWN LOGIC
// const shutdown = async (signal: string) => {
//   console.log(`\n Received ${signal}. Shutting down gracefully...`);
  
//   if (server) {
//     server.close(async () => {
//       console.log(' HTTP server closed.');
//       try {
//         await pool.end(); 
//         console.log(' Database pool closed.');
//         process.exit(0);
//       } catch (err) {
//         console.error(' Error during database disconnection:', err);
//         process.exit(1);
//       }
//     });
//   } else {
//     process.exit(0);
//   }
// };

// process.on('SIGINT', () => shutdown('SIGINT'));
// process.on('SIGTERM', () => shutdown('SIGTERM'));