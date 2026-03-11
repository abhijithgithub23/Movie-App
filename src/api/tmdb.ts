import axios from "axios";
import i18n from "../i18n"; // Make sure this points to your i18n setup

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

// Axios instance for TMDB requests
export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${READ_ACCESS_TOKEN}`, // optional for public endpoints
    "Content-Type": "application/json",
  },
  params: {
    api_key: API_KEY, // needed for all requests
  },
});

// Request interceptor to inject the current language dynamically
tmdbApi.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    language: i18n.language, // automatically use selected language
  };
  return config; 
});

// Helper functions
export const fetchTrending = () => tmdbApi.get("/trending/all/day");

export const searchMedia = (query: string) =>
  tmdbApi.get("/search/multi", { params: { query } });

export const fetchDetails = (type: "movie" | "tv", id: number | string) =>
  tmdbApi.get(`/${type}/${id}`);

// Optional: test function
// async function testTMDB() {
//   try {
//     const trending = await fetchTrending();
//     console.log("Trending:", trending.data);

//     const search = await searchMedia("Inception");
//     console.log("Search:", search.data);

//     const details = await fetchDetails("movie", 550);
//     console.log("Details:", details.data);
//   } catch (error) {
//     console.error("API error:", error);
//   }
// }

// testTMDB();