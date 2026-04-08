// src/db/schema.ts
import { pgTable, serial, integer, varchar, text, date, numeric, boolean, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core';


export const genres = pgTable('genres', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  
  // Maps DB 'password_hash' to TS 'passwordHash'
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  
  // Maps DB 'is_admin' to TS 'isAdmin'
  isAdmin: boolean('is_admin').default(false),
  
  profilePic: text('profile_pic'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Export inferred types for use across your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;



export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  tmdbId: integer('tmdb_id').notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }),
  originalName: varchar('original_name', { length: 255 }),
  overview: text('overview'),
  tagline: text('tagline'),
  releaseDate: date('release_date'),
  firstAirDate: date('first_air_date'),
  runtime: integer('runtime'),
  numberOfSeasons: integer('number_of_seasons'),
  numberOfEpisodes: integer('number_of_episodes'),
  voteAverage: numeric('vote_average', { precision: 4, scale: 2 }),
  popularity: numeric('popularity', { precision: 10, scale: 2 }),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  genres: jsonb('genres'),
  spokenLanguages: jsonb('spoken_languages'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

  credits: jsonb('credits'),
  seasons: jsonb('seasons'),
  networks: jsonb('networks'),
  productionCompanies: jsonb('production_companies'),
  productionCountries: jsonb('production_countries'),
  createdBy: jsonb('created_by'),
  
  

});

export const mediaGenres = pgTable('media_genres', {
  mediaTmdbId: integer('media_tmdb_id').references(() => media.tmdbId, { onDelete: 'cascade' }),
  genreId: integer('genre_id'),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;




export const userFavorites = pgTable('user_favorites', {
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  mediaTmdbId: integer('media_tmdb_id').references(() => media.tmdbId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.mediaTmdbId] })
  };
});