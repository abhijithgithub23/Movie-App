import { db } from './db'; 
import { genres } from '../db/schema';

export const initializeDatabase = async () => {
  try {
    console.log('[DB] Verifying required database seeds...');

    // Seed initial genres (Idempotent: won't crash if they already exist)
    await db.insert(genres).values([
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ]).onConflictDoNothing({ target: genres.id });

    console.log('[DB] Database seeded successfully!');

  } catch (error) {
    console.error('[DB] Error seeding database:', error);
    // Depending on your setup, you might want to throw the error to stop the server booting
    throw error; 
  }
};