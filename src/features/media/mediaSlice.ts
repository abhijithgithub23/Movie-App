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

export const getMovies = createAsyncThunk<Media[]>(
  "media/getMovies",
  async () => {
    const res = await tmdbApi.get("/discover/movie");
    return fetchFullDetails(res.data.results, "movie");
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
    // Add a new custom movie/show
    addMedia: (state, action: PayloadAction<Media>) => {
      const newMedia: Media = {
        ...action.payload,
        id: `custom-${Date.now()}`,
        isCustom: true,
      };
      
      // 1. Save to persisted arrays
      state.customMovies.unshift(newMedia);
      state.edited.push(newMedia); 

      // 2. Add directly to the live view arrays so it shows up immediately
      state.trending.unshift(newMedia);
      if (newMedia.media_type === 'tv') {
        state.tvShows.unshift(newMedia);
      } else {
        state.movies.unshift(newMedia);
      }
    },

    // Edit custom or API item
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

    // Delete custom or API item
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
    // Merge API data with persisted edits/deletes AND custom movies
    const mergeApiWithUserData = (
      fetched: Media[], 
      state: MediaState, 
      listType: 'movie' | 'tv' | 'all'
    ) => {
      // 1. Filter out deleted API items and apply edits
      let filteredApi = fetched.filter((m) => !state.deleted.includes(m.id));
      filteredApi = filteredApi.map(
        (m) => state.edited.find((e) => String(e.id) === String(m.id)) || m
      );

      // 2. Get relevant custom items that haven't been deleted
      let relevantCustom = state.customMovies.filter((m) => !state.deleted.includes(m.id));
      if (listType === 'movie') {
        relevantCustom = relevantCustom.filter((m) => m.media_type === 'movie');
      } else if (listType === 'tv') {
        relevantCustom = relevantCustom.filter((m) => m.media_type === 'tv');
      }

      // 3. Put custom items at the top, followed by the API items
      return [...relevantCustom, ...filteredApi];
    };

    // TRENDING
    builder
      .addCase(getTrending.pending, (state) => {
        state.status.trending = "loading";
      })
      .addCase(getTrending.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.trending = "succeeded";
        state.trending = mergeApiWithUserData(action.payload, state, 'all');
      })
      .addCase(getTrending.rejected, (state) => {
        state.status.trending = "failed";
      });

    // MOVIES
    builder
      .addCase(getMovies.pending, (state) => {
        state.status.movies = "loading";
      })
      .addCase(getMovies.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.movies = "succeeded";
        state.movies = mergeApiWithUserData(action.payload, state, 'movie');
      })
      .addCase(getMovies.rejected, (state) => {
        state.status.movies = "failed";
      });

    // TV SHOWS
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

    // SEARCH
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