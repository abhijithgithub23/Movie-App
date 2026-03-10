import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { tmdbApi } from "../../api/tmdb";
import type { Media } from "../../types";

interface MediaState {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  customMovies: Media[];  // persisted
  edited: Media[];        // persisted edits
  deleted: (string | number)[]; // persisted deletions
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

// Helper: fetch full details for TMDB items
const fetchFullDetails = async (
  items: Media[],
  defaultMediaType: "movie" | "tv" = "movie"
) => {
  return Promise.all(
    items.map(async (item) => {
      if (String(item.id).startsWith("custom")) return item; // skip custom
      try {
        const mediaType = item.media_type || defaultMediaType;
        const res = await tmdbApi.get(`/${mediaType}/${item.id}`);
        return { ...item, ...res.data, media_type: mediaType } as Media;
      } catch {
        return { ...item, media_type: item.media_type || defaultMediaType };
      }
    })
  );
};

// Thunks
export const getTrending = createAsyncThunk<Media[]>(
  "media/getTrending",
  async () => {
    const res = await tmdbApi.get("/trending/all/day");
    return fetchFullDetails(res.data.results);
  }
);

// UPDATED: Resolves the TS error by explicitly defining a local number variable
export const getMovies = createAsyncThunk<{ results: Media[]; page: number }, number | void>(
  "media/getMovies",
  async (pageArg) => {
    // If pageArg is void (undefined), default to 1. 
    // This guarantees currentPage is ALWAYS a number.
    const currentPage = typeof pageArg === "number" ? pageArg : 1;
    
    const res = await tmdbApi.get("/discover/movie", { params: { page: currentPage } });
    const results = await fetchFullDetails(res.data.results, "movie");

    console.log(`Fetched movies for page ${currentPage}:`, results);
    
    return { results, page: currentPage };
  }
);

export const getTVShows = createAsyncThunk<Media[]>(
  "media/getTVShows",
  async () => {
    const res = await tmdbApi.get("/discover/tv");
    return fetchFullDetails(res.data.results, "tv");
  }
);

export const searchMediaThunk = createAsyncThunk<Media[], string>(
  "media/searchMedia",
  async (query) => {
    const res = await tmdbApi.get("/search/multi", { params: { query } });
    return res.data.results;
  }
);

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

      if (newMedia.media_type === 'tv') {
        state.tvShows.unshift(newMedia);
      } else {
        state.movies.unshift(newMedia);
      }
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
  },
  extraReducers: (builder) => {
    // UPDATED: Added `includeCustom` flag so custom movies aren't duplicated on page 2+
    const mergeApiWithUserData = (
      fetched: Media[], 
      state: MediaState, 
      listType: 'movie' | 'tv' | 'trending',
      includeCustom: boolean = true
    ) => {
      let filteredApi = fetched.filter((m) => !state.deleted.includes(m.id));
      filteredApi = filteredApi.map(
        (m) => state.edited.find((e) => String(e.id) === String(m.id)) || m
      );

      let relevantCustom: Media[] = [];
      if (listType !== 'trending' && includeCustom) {
        relevantCustom = state.customMovies.filter((m) => !state.deleted.includes(m.id));
        if (listType === 'movie') {
          relevantCustom = relevantCustom.filter((m) => m.media_type === 'movie');
        } else if (listType === 'tv') {
          relevantCustom = relevantCustom.filter((m) => m.media_type === 'tv');
        }
      }

      return [...relevantCustom, ...filteredApi];
    };

    builder
      .addCase(getTrending.pending, (state) => {
        state.status.trending = "loading";
      })
      .addCase(getTrending.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.trending = "succeeded";
        state.trending = mergeApiWithUserData(action.payload, state, 'trending');
      })
      .addCase(getTrending.rejected, (state) => {
        state.status.trending = "failed";
      });

    // UPDATED MOVIES BUILDER: Handles pagination appending
    builder
      .addCase(getMovies.pending, (state) => {
        state.status.movies = "loading";
      })
      .addCase(getMovies.fulfilled, (state, action: PayloadAction<{ results: Media[]; page: number }>) => {
        state.status.movies = "succeeded";
        const isFirstPage = action.payload.page === 1;
        
        const processedNew = mergeApiWithUserData(
          action.payload.results, 
          state, 
          'movie', 
          isFirstPage // Only include custom items on the first page
        );

        if (isFirstPage) {
          state.movies = processedNew;
        } else {
          // Append new movies, filtering out any accidental duplicates
          const existingIds = new Set(state.movies.map(m => String(m.id)));
          const uniqueNew = processedNew.filter(m => !existingIds.has(String(m.id)));
          state.movies = [...state.movies, ...uniqueNew];
        }
      })
      .addCase(getMovies.rejected, (state) => {
        state.status.movies = "failed";
      });

    builder
      .addCase(getTVShows.pending, (state) => {
        state.status.tvShows = "loading";
      })
      .addCase(getTVShows.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.tvShows = "succeeded";
        state.tvShows = mergeApiWithUserData(action.payload, state, 'tv');
      })
      .addCase(getTVShows.rejected, (state) => {
        state.status.tvShows = "failed";
      });

    builder
      .addCase(searchMediaThunk.pending, (state) => {
        state.status.searchResults = "loading";
      })
      .addCase(searchMediaThunk.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.searchResults = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchMediaThunk.rejected, (state) => {
        state.status.searchResults = "failed";
      });
  },
});

export const { addMedia, editMedia, deleteMedia } = mediaSlice.actions;
export default mediaSlice.reducer;