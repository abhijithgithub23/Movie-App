import pool from './db'; // Adjust path if needed

export const initializeDatabase = async () => {
  try {
    // 1. Ask Postgres if the 'media' table already exists
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'media'
      );
    `;
    
    const { rows } = await pool.query(checkQuery);
    const tableExists = rows[0].exists;

    // 2. If it exists, print a success message and stop.
    if (tableExists) {
      console.log('✅ Database schema already exists. No new tables created.');
      return; 
    }

    // 3. If it does NOT exist, print an alert and run the build script
    console.log('⚠️ Database tables not found. Creating schema now...');

    const schemaQuery = `
      -- 1. GENRES TABLE
      CREATE TABLE IF NOT EXISTS genres (
          id INTEGER PRIMARY KEY,
          name VARCHAR(100) NOT NULL
      );

      -- 2. UNIFIED MEDIA TABLE
      CREATE TABLE IF NOT EXISTS media (
          id SERIAL PRIMARY KEY,
          tmdb_id INT UNIQUE NOT NULL,
          type VARCHAR(20) NOT NULL,
          title VARCHAR(255),
          original_title VARCHAR(255),
          original_name VARCHAR(255),
          overview TEXT,
          tagline TEXT,
          status VARCHAR(50),
          release_date DATE,
          first_air_date DATE,
          last_air_date DATE,
          runtime INT,
          episode_run_time INT,
          number_of_episodes INT,
          number_of_seasons INT,
          adult BOOLEAN,
          popularity NUMERIC(10,2),
          vote_average NUMERIC(4,2),
          vote_count INT,
          homepage TEXT,
          imdb_id VARCHAR(20),
          backdrop_path TEXT,
          poster_path TEXT,
          
          genres JSONB,
          production_companies JSONB,
          production_countries JSONB,
          spoken_languages JSONB,
          created_by JSONB,
          seasons JSONB,
          networks JSONB,
          last_episode_to_air JSONB,
          next_episode_to_air JSONB,
          credits JSONB,
          
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 3. MEDIA GENRES JUNCTION
      CREATE TABLE IF NOT EXISTS media_genres (
          media_tmdb_id INTEGER REFERENCES media(tmdb_id) ON DELETE CASCADE,
          genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
          PRIMARY KEY (media_tmdb_id, genre_id)
      );

      -- 4. USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
      );

      -- 5. FAVORITES TABLE
      CREATE TABLE IF NOT EXISTS user_favorites (
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          media_tmdb_id INTEGER REFERENCES media(tmdb_id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (user_id, media_tmdb_id)
      );
    `;

    await pool.query(schemaQuery);
    console.log('🚀 Database schema created successfully!');

  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error; 
  }
};