// import axios from "axios";
// import dotenv from "dotenv";
// import { pool } from "../config/db";

// dotenv.config();

// const API_KEY = process.env.TMDB_API_KEY;
// if (!API_KEY) {
//   console.error("TMDB_API_KEY missing. Cannot fetch data.");
//   process.exit(1);
// }

// const BASE_URL = "https://api.themoviedb.org/3";

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// async function fetchWithRetry(url: string, retries = 5) {
//   try {
//     const res = await axios.get(url);
//     return res.data;
//   } catch (err) {
//     if (retries === 0) throw err;

//     console.log("Request failed. Retrying...");
//     await sleep(2000);
//     return fetchWithRetry(url, retries - 1);
//   }
// }

// // NEW FUNCTION: Fetches and ---------------------------------------- inserts all TMDB genres first --------------------------------------------------------------------
// async function seedGenres() {
//   console.log("Seeding genres from TMDB...");

//   const movieGenresData = await fetchWithRetry(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
//   const tvGenresData = await fetchWithRetry(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`);

//   // Combine both arrays (there is some overlap, but ON CONFLICT handles duplicates)
//   const allGenres = [...movieGenresData.genres, ...tvGenresData.genres];

//   for (const genre of allGenres) {
//     const query = `
//       INSERT INTO genres (id, name) 
//       VALUES ($1, $2)
//       ON CONFLICT (id) DO NOTHING
//     `;
//     await pool.query(query, [genre.id, genre.name]);
//   }

//   console.log("Genres seeded successfully");
// }


// ----------------------------------------------------------------------to insert movis to media table--------------------------------------------------------------------
// async function seedMovies() {
//   console.log("Seeding movies...");

//   for (let page = 1; page <= 20; page++) {
//     console.log(`Fetching movie page ${page}...`);

//     const data = await fetchWithRetry(
//       `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}`
//     );

//     for (const movie of data.results) {
//       const mediaQuery = `
//         INSERT INTO media (tmdb_id, title, overview, poster_path, backdrop_path, release_date, vote_average, media_type)
//         VALUES ($1,$2,$3,$4,$5,$6,$7,'movie')
//         ON CONFLICT (tmdb_id) DO NOTHING
//       `;

//       await pool.query(mediaQuery, [
//         movie.id,
//         movie.title,
//         movie.overview,
//         movie.poster_path,
//         movie.backdrop_path,
//         movie.release_date || null, // Handle occasional empty dates
//         movie.vote_average,
//       ]);

//       if (movie.genre_ids) {
//         for (const genreId of movie.genre_ids) {
//           const genreQuery = `
//             INSERT INTO media_genres (media_tmdb_id, genre_id)
//             VALUES ($1,$2)
//             ON CONFLICT DO NOTHING
//           `;

//           await pool.query(genreQuery, [movie.id, genreId]);
//         }
//       }
//     }

//     await sleep(1200);
//   }

//   console.log("Movies seeded successfully");
// }

// -----------------------------------------------------------to insert tvshow to media table---------------------------------------------------------------------------
// async function seedTV() {
//   console.log("Seeding TV shows...");

//   for (let page = 1; page <= 20; page++) {
//     console.log(`Fetching TV page ${page}...`);

//     const data = await fetchWithRetry(
//       `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}`
//     );

//     for (const tv of data.results) {
//       const mediaQuery = `
//         INSERT INTO media (tmdb_id, title, overview, poster_path, backdrop_path, release_date, vote_average, media_type)
//         VALUES ($1,$2,$3,$4,$5,$6,$7,'tv')
//         ON CONFLICT (tmdb_id) DO NOTHING
//       `;

//       await pool.query(mediaQuery, [
//         tv.id,
//         tv.name,
//         tv.overview,
//         tv.poster_path,
//         tv.backdrop_path,
//         tv.first_air_date || null, // Handle occasional empty dates
//         tv.vote_average,
//       ]);

//       if (tv.genre_ids) {
//         for (const genreId of tv.genre_ids) {
//           const genreQuery = `
//             INSERT INTO media_genres (media_tmdb_id, genre_id)
//             VALUES ($1,$2)
//             ON CONFLICT DO NOTHING
//           `;

//           await pool.query(genreQuery, [tv.id, genreId]);
//         }
//       }
//     }

//     await sleep(1200);
//   }

//   console.log("TV shows seeded successfully");
// }

// async function runSeeder() {
//   try {
//     await seedGenres(); // Make sure genres are populated before media!
//     await seedMovies();
//     await seedTV();
//     console.log("Database seeding completed");
//     process.exit();
//   } catch (err) {
//     console.error("Seeder crashed:", err);
//     process.exit(1);
//   }
// }

// runSeeder();


// ------------------------------------------FETACH DETAILS and add to media_detail table --------------------------------------------------------------------------------

// import axios from "axios";
// import dotenv from "dotenv";
// import { pool } from "../config/db";

// dotenv.config();

// const TMDB_KEY = process.env.TMDB_API_KEY;

// // Rate limiting helper
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// async function fetchMediaDetail(tmdbId: number, type: "movie" | "tv") {
//   const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits,seasons`;
//   const { data } = await axios.get(url);
//   return data;
// }

// async function seedMediaDetails() {
//   console.log("Fetching media from database...");
  
//   // FIX 1: Changed "type" to "media_type"
//   const mediaRows = await pool.query("SELECT id, tmdb_id, media_type FROM media");

//   console.log(`Found ${mediaRows.rows.length} items. Starting detail fetch...`);

//   for (const media of mediaRows.rows) {
//     if (!media.tmdb_id) continue;

//     try {
//       // FIX 1: Accessing media.media_type
//       const detail = await fetchMediaDetail(media.tmdb_id, media.media_type);
      
//       // FIX 2: Added $34 to the VALUES list
//       await pool.query(
//         `INSERT INTO media_details (
//           media_id, tmdb_id, type, title, original_title, original_name,
//           overview, tagline, status, release_date, first_air_date, last_air_date,
//           runtime, episode_run_time, number_of_episodes, number_of_seasons,
//           adult, popularity, vote_average, vote_count, homepage, imdb_id,
//           backdrop_path, poster_path, genres, production_companies,
//           production_countries, spoken_languages, created_by, seasons,
//           networks, last_episode_to_air, next_episode_to_air, credits
//         ) VALUES (
//           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34
//         )
//         ON CONFLICT (tmdb_id) DO NOTHING`, // Good practice to prevent duplicate crashes if you run this twice
//         [
//           media.id,
//           media.tmdb_id,
//           media.media_type, // Passing the correct variable
//           detail.title || detail.name || null,
//           detail.original_title || null,
//           detail.original_name || null,
//           detail.overview || null,
//           detail.tagline || null,
//           detail.status || null,
//           detail.release_date || null,
//           detail.first_air_date || null,
//           detail.last_air_date || null,
//           detail.runtime || null,
//           detail.episode_run_time ? detail.episode_run_time[0] : null,
//           detail.number_of_episodes || null,
//           detail.number_of_seasons || null,
//           detail.adult ?? null,
//           detail.popularity ?? null,
//           detail.vote_average ?? null,
//           detail.vote_count ?? null,
//           detail.homepage || null,
//           detail.imdb_id || null,
//           detail.backdrop_path || null,
//           detail.poster_path || null,
//           JSON.stringify(detail.genres || []),
//           JSON.stringify(detail.production_companies || []),
//           JSON.stringify(detail.production_countries || []),
//           JSON.stringify(detail.spoken_languages || []),
//           JSON.stringify(detail.created_by || []),
//           JSON.stringify(detail.seasons || []),
//           JSON.stringify(detail.networks || []),
//           JSON.stringify(detail.last_episode_to_air || {}),
//           JSON.stringify(detail.next_episode_to_air || {}),
//           JSON.stringify(detail.credits || {})
//         ]
//       );

//       console.log(`Inserted details for media_id ${media.id} (${detail.title || detail.name})`);
      
//       // FIX 3: Added sleep to respect TMDB rate limits
//       await sleep(250); 
      
//     } catch (err: any) {
//       console.error(`Failed to fetch/insert for TMDB ID ${media.tmdb_id}:`, err.message);
//     }
//   }
  
//   console.log("Finished seeding media details!");
//   process.exit(0);
// }

// seedMediaDetails();