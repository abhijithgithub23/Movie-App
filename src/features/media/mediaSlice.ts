// features/media/mediaSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tmdbApi } from '../../api/tmdb';
import type { Media } from '../../types';

type LocalMedia = {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  edited: Media[];
  deleted: (string | number)[];
};

const getLocalMedia = (): LocalMedia => {
  const data = localStorage.getItem('customMedia');
  return data
    ? JSON.parse(data)
    : { trending: [], movies: [], tvShows: [], edited: [], deleted: [] };
};

const saveLocalMedia = (data: LocalMedia) => {
  localStorage.setItem('customMedia', JSON.stringify(data));
};

// ✅ Properly typed Async Thunks
export const getTrending = createAsyncThunk<Media[]>('media/getTrending', async () => {
  const res = await tmdbApi.get('/trending/all/day');
  return res.data.results;
});

export const getMovies = createAsyncThunk<Media[]>('media/getMovies', async () => {
  const res = await tmdbApi.get('/discover/movie');
  return res.data.results;
});

export const getTVShows = createAsyncThunk<Media[]>('media/getTVShows', async () => {
  const res = await tmdbApi.get('/discover/tv');
  return res.data.results;
});

export const searchMediaThunk = createAsyncThunk<Media[], string>(
  'media/searchMedia',
  async (query) => {
    const res = await tmdbApi.get('/search/multi', { params: { query } });
    console.log("Search Results: ", res.data.results);
    return res.data.results;
  }
);

interface MediaState {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  searchResults: Media[];
  status: {
    trending: 'idle' | 'loading' | 'succeeded' | 'failed';
    movies: 'idle' | 'loading' | 'succeeded' | 'failed';
    tvShows: 'idle' | 'loading' | 'succeeded' | 'failed';
    searchResults: 'idle' | 'loading' | 'succeeded' | 'failed';
  };
}

const initialState: MediaState = {
  trending: [],
  movies: [],
  tvShows: [],
  searchResults: [],
  status: {
    trending: 'idle',
    movies: 'idle',
    tvShows: 'idle',
    searchResults: 'idle',
  },
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    addMedia: (
      state,
      action: PayloadAction<{ media: Media; type: 'trending' | 'movies' | 'tvShows' }>
    ) => {
      const { media, type } = action.payload;
      const newMedia = { ...media, id: `custom-${Date.now()}`, isCustom: true };
      (state[type] as Media[]).unshift(newMedia);

      const local = getLocalMedia();
      local[type].push(newMedia);
      saveLocalMedia(local);
    },

    editMedia: (
      state,
      action: PayloadAction<{ media: Media; type: 'trending' | 'movies' | 'tvShows' }>
    ) => {
      const { media, type } = action.payload;
      const index = (state[type] as Media[]).findIndex((m) => m.id === media.id);
      if (index !== -1) (state[type] as Media[])[index] = media;

      const local = getLocalMedia();
      const editIndex = local.edited.findIndex((m) => m.id === media.id);
      if (editIndex !== -1) local.edited[editIndex] = media;
      else local.edited.push(media);

      saveLocalMedia(local);
    },

    deleteMedia: (
      state,
      action: PayloadAction<{ id: string | number; type: 'trending' | 'movies' | 'tvShows' }>
    ) => {
      const { id, type } = action.payload;
      (state[type] as Media[]) = (state[type] as Media[]).filter((m) => m.id !== id);

      const local = getLocalMedia();
      local.deleted.push(id);
      saveLocalMedia(local);
    },
  },
  extraReducers: (builder) => {
    builder
      // Trending
      .addCase(getTrending.pending, (state) => {
        state.status.trending = 'loading';
      })
      .addCase(getTrending.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.trending = 'succeeded';
        const local = getLocalMedia();
        let merged = action.payload.filter((m) => !local.deleted.includes(m.id));
        merged = merged.map((m) => local.edited.find((e) => e.id === m.id) || m);
        state.trending = [...local.trending, ...merged];
      })
      .addCase(getTrending.rejected, (state) => {
        state.status.trending = 'failed';
      })

      // Movies
      .addCase(getMovies.pending, (state) => {
        state.status.movies = 'loading';
      })
      .addCase(getMovies.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.movies = 'succeeded';
        state.movies = action.payload;
      })
      .addCase(getMovies.rejected, (state) => {
        state.status.movies = 'failed';
      })

      // TV Shows
      .addCase(getTVShows.pending, (state) => {
        state.status.tvShows = 'loading';
      })
      .addCase(getTVShows.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.tvShows = 'succeeded';
        state.tvShows = action.payload;
      })
      .addCase(getTVShows.rejected, (state) => {
        state.status.tvShows = 'failed';
      })

      // Search
      .addCase(searchMediaThunk.pending, (state) => {
        state.status.searchResults = 'loading';
      })
      .addCase(searchMediaThunk.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.searchResults = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchMediaThunk.rejected, (state) => {
        state.status.searchResults = 'failed';
      });
  },
});

export const { addMedia, editMedia, deleteMedia } = mediaSlice.actions;
export default mediaSlice.reducer;