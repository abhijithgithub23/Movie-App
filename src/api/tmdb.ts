import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

// Axios instance for TMDB requests
export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${READ_ACCESS_TOKEN}`, // optional for public endpoints
    'Content-Type': 'application/json',
  },
  params: {
    api_key: API_KEY, // needed for all requests
  },
});

// Helper functions
export const fetchTrending = () => tmdbApi.get('/trending/all/day');
export const searchMedia = (query: string) => tmdbApi.get('/search/multi', { params: { query } });
export const fetchDetails = (type: 'movie' | 'tv', id: number | string) =>
  tmdbApi.get(`/${type}/${id}`);