import { z } from 'zod';

// Helper to safely check past/present dates without crashing on empty strings
const pastOrPresentDate = z.string().trim().nullable().optional().refine((date) => {
  if (!date) return true; // Allow empty/null
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
}, 'Date cannot be in the future');

const mediaBodySchema = z.object({
  type: z.enum(['movie', 'tv'] as const, { message: "Type must be 'movie' or 'tv'" }),
  
  // Optional because a TV show might only send original_name
  title: z.string().trim().min(1, 'Title is required').optional(),
  original_name: z.string().trim().min(1, 'Name is required').optional(),
  
  // Tagline can be an empty string
  tagline: z.string().trim().optional().nullable(),
  
  overview: z.string().trim()
    .min(10, 'Overview must be at least 10 characters')
    .refine(val => val.split(/\s+/).length >= 3, 'Overview must contain at least 3 words'),
    
  poster_path: z.string().trim().url('Poster must be a valid URL'),
  backdrop_path: z.string().trim().url('Backdrop must be a valid URL').optional().nullable().or(z.literal('')),
  
  release_date: pastOrPresentDate,
  first_air_date: pastOrPresentDate,
  
  // Numbers can be undefined if left blank on the frontend
  runtime: z.number().positive('Runtime must be positive').optional().nullable(),
  number_of_seasons: z.number().positive().optional().nullable(),
  number_of_episodes: z.number().positive().optional().nullable(),
  
  vote_average: z.number().min(0).max(10, 'Rating must be between 0 and 10').optional().nullable(),
  popularity: z.number().nonnegative('Popularity must be positive').optional().nullable(),
  
  genres: z.array(z.object({ id: z.number(), name: z.string() })).min(1, 'At least one genre is required'),
  spoken_languages: z.array(z.object({ iso_639_1: z.string(), english_name: z.string(), name: z.string() })).min(1, 'At least one language is required'),
}).refine(data => data.title || data.original_name, {
  message: "Either title or original_name must be provided",
  path: ["title"] // Attaches the error to the title field if both are missing
});

export const addMediaSchema = z.object({
  body: mediaBodySchema
});

export const updateMediaSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a numeric string')
  }),
  body: mediaBodySchema
});

export const mediaIdParamSchema = z.object({
  params: z.object({
    type: z.enum(['movie', 'tv'] as const).optional(),
    id: z.string().regex(/^\d+$/, 'ID must be a numeric string')
  })
});

export const searchQuerySchema = z.object({
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
    mediaType: z.string().optional(),
    year: z.string().optional(),
    rating: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    language: z.string().optional(),
    genre: z.string().regex(/^\d+$/).optional()
  })
});