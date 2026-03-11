import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { tmdbApi } from "../../api/tmdb";
import type { Media } from "../../types";

interface MediaState {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  customMovies: Media[];  
  edited: Media[];        
  deleted: (string | number)[]; 
  searchResults: Media[];
  status: {
    trending: "idle" | "loading" | "succeeded" | "failed";
    movies: "idle" | "loading" | "succeeded" | "failed";
    tvShows: "idle" | "loading" | "succeeded" | "failed";
    searchResults: "idle" | "loading" | "succeeded" | "failed";
  };
}

const initialState: MediaState = {
  trending: [],
  movies: [],
  tvShows: [], 
  customMovies: [],
  edited: [],
  deleted: [],
  searchResults: [],
  status: {
    trending: "idle",
    movies: "idle",
    tvShows: "idle",
    searchResults: "idle",
  },
};

// -----------------------------
// Thunks
// -----------------------------

//  Trending
export const getTrending = createAsyncThunk<Media[]>(
  "media/getTrending",
  async () => {
    const res = await tmdbApi.get("/trending/all/day");
    return res.data.results; // only basic info, NO fetchFullDetails
  }
);

//  Movies
export const getMovies = createAsyncThunk<{ results: Media[]; page: number }, number | void>(
  "media/getMovies",
  async (pageArg) => {
    const page = typeof pageArg === "number" ? pageArg : 1;
    const res = await tmdbApi.get("/discover/movie", { params: { page } });
    return { results: res.data.results, page };
  }
);

//  TV Shows
export const getTVShows = createAsyncThunk<{ results: Media[]; page: number }, number | void>(
  "media/getTVShows",
  async (pageArg) => {
    const page = typeof pageArg === "number" ? pageArg : 1;
    const res = await tmdbApi.get("/discover/tv", { params: { page } });
    return { results: res.data.results, page };
  }
);

//  Search
export const searchMediaThunk = createAsyncThunk<Media[], string>(
  "media/searchMedia",
  async (query) => {
    const res = await tmdbApi.get("/search/multi", { params: { query } });
    return res.data.results;
  }
);

// -----------------------------
// Slice
// -----------------------------

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    addMedia: (state, action: PayloadAction<Media>) => {
      const newMedia: Media = {
        ...action.payload,
        id: `custom-${Date.now()}`,
        isCustom: true,
      };
      state.customMovies.unshift(newMedia);
      state.edited.push(newMedia);

      if (newMedia.media_type === 'tv') state.tvShows.unshift(newMedia);
      else state.movies.unshift(newMedia);
    },

    editMedia: (state, action: PayloadAction<Media>) => {
      const media = action.payload;
      const keys: Array<"trending" | "movies" | "tvShows" | "customMovies"> = [
        "trending",
        "movies",
        "tvShows",
        "customMovies",
      ];

      keys.forEach((key) => {
        const index = state[key].findIndex((m) => String(m.id) === String(media.id));
        if (index !== -1) state[key][index] = media;
      });

      const editIndex = state.edited.findIndex((m) => String(m.id) === String(media.id));
      if (editIndex !== -1) state.edited[editIndex] = media;
      else state.edited.push(media);
    },

    deleteMedia: (state, action: PayloadAction<string | number>) => {
      const id = action.payload;
      state.customMovies = state.customMovies.filter((m) => String(m.id) !== String(id));
      state.trending = state.trending.filter((m) => String(m.id) !== String(id));
      state.movies = state.movies.filter((m) => String(m.id) !== String(id));
      state.tvShows = state.tvShows.filter((m) => String(m.id) !== String(id));
      if (!state.deleted.includes(id)) state.deleted.push(id);
    },

    // NEW: Action to clear search results when the input becomes empty
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.status.searchResults = "idle";
    },
  },

  extraReducers: (builder) => {
    const mergeApiWithUserData = (
      fetched: Media[], 
      state: MediaState, 
      listType: 'movie' | 'tv' | 'trending',
      includeCustom: boolean = true
    ) => {
      //  Remove deleted
      let filteredApi = fetched.filter((m) => !state.deleted.includes(m.id));

      //  Merge edits
      filteredApi = filteredApi.map(
        (m) => state.edited.find((e) => String(e.id) === String(m.id)) || m
      );

      //  Include custom items
      let relevantCustom: Media[] = [];
      if (listType !== 'trending' && includeCustom) {
        relevantCustom = state.customMovies.filter((m) => !state.deleted.includes(m.id));
        if (listType === 'movie') relevantCustom = relevantCustom.filter((m) => m.media_type === 'movie');
        else if (listType === 'tv') relevantCustom = relevantCustom.filter((m) => m.media_type === 'tv');
      }

      return [...relevantCustom, ...filteredApi];
    };

    // --- Trending
    builder
      .addCase(getTrending.pending, (state) => { state.status.trending = "loading"; })
      .addCase(getTrending.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.trending = "succeeded";
        state.trending = mergeApiWithUserData(action.payload, state, 'trending');
      })
      .addCase(getTrending.rejected, (state) => { state.status.trending = "failed"; });

    // --- Movies
    builder
      .addCase(getMovies.pending, (state) => { state.status.movies = "loading"; })
      .addCase(getMovies.fulfilled, (state, action: PayloadAction<{ results: Media[]; page: number }>) => {
        state.status.movies = "succeeded";
        const isFirstPage = action.payload.page === 1;
        const processed = mergeApiWithUserData(action.payload.results, state, 'movie', isFirstPage);

        if (isFirstPage) state.movies = processed;
        else {
          const existingIds = new Set(state.movies.map(m => String(m.id)));
          state.movies = [...state.movies, ...processed.filter(m => !existingIds.has(String(m.id)))];
        }
      })
      .addCase(getMovies.rejected, (state) => { state.status.movies = "failed"; });

    // --- TV Shows
    builder
      .addCase(getTVShows.pending, (state) => { state.status.tvShows = "loading"; })
      .addCase(getTVShows.fulfilled, (state, action: PayloadAction<{ results: Media[]; page: number }>) => {
        state.status.tvShows = "succeeded";
        const isFirstPage = action.payload.page === 1;
        const processed = mergeApiWithUserData(action.payload.results, state, 'tv', isFirstPage);

        if (isFirstPage) state.tvShows = processed;
        else {
          const existingIds = new Set(state.tvShows.map(m => String(m.id)));
          state.tvShows = [...state.tvShows, ...processed.filter(m => !existingIds.has(String(m.id)))];
        }
      })
      .addCase(getTVShows.rejected, (state) => { state.status.tvShows = "failed"; });

    // --- Search
    builder
      .addCase(searchMediaThunk.pending, (state) => { state.status.searchResults = "loading"; })
      .addCase(searchMediaThunk.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.searchResults = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchMediaThunk.rejected, (state) => { state.status.searchResults = "failed"; });
  },
});

// REMEMBER to export the new clearSearchResults action here
export const { addMedia, editMedia, deleteMedia, clearSearchResults } = mediaSlice.actions;
export default mediaSlice.reducer;