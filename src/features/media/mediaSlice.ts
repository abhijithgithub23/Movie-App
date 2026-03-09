import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { tmdbApi } from '../../api/tmdb';
import type { Media } from '../../types';

type LocalMedia = {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  customMovies: Media[];
  edited: Media[];
  deleted: (string | number)[];
};

const getLocalMedia = (): LocalMedia => {
  const data = localStorage.getItem('customMedia');
  if (!data) {
    return { trending: [], movies: [], tvShows: [], customMovies: [], edited: [], deleted: [] };
  }
  const parsed = JSON.parse(data);
  return {
    trending: parsed.trending || [],
    movies: parsed.movies || [],
    tvShows: parsed.tvShows || [],
    customMovies: parsed.customMovies || [],
    edited: parsed.edited || [],
    deleted: parsed.deleted || [],
  };
};

const saveLocalMedia = (data: LocalMedia) => {
  localStorage.setItem('customMedia', JSON.stringify(data));
};

const initialLocal = getLocalMedia();
const initialCustomMovies = initialLocal.customMovies.map(
  (m) => initialLocal.edited.find((e) => String(e.id) === String(m.id)) || m
);

// Async Thunks
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
    return res.data.results;
  }
);

interface MediaState {
  trending: Media[];
  movies: Media[];
  tvShows: Media[];
  customMovies: Media[];
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
  customMovies: initialCustomMovies,
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
      action: PayloadAction<{ media: Media; type: 'trending' | 'movies' | 'tvShows' | 'customMovies' }>
    ) => {
      const { media, type } = action.payload;
      const newMedia: Media = { ...media, id: `custom-${Date.now()}`, isCustom: true };
      state[type].unshift(newMedia);

      const local = getLocalMedia();
      local[type].unshift(newMedia);
      saveLocalMedia(local);
    },

    editMedia: (
      state,
      action: PayloadAction<{ media: Media; type: 'trending' | 'movies' | 'tvShows' | 'customMovies' }>
    ) => {
      const { media } = action.payload;

      // FIX: Update the media across ALL arrays so the UI re-renders instantly no matter what page we are viewing
      const stateKeys: ('trending' | 'movies' | 'tvShows' | 'customMovies' | 'searchResults')[] = [
        'trending', 'movies', 'tvShows', 'customMovies', 'searchResults'
      ];

      stateKeys.forEach((key) => {
        const index = state[key].findIndex((m) => String(m.id) === String(media.id));
        if (index !== -1) {
          state[key][index] = media; // This mutation updates Redux state and triggers the UI re-render
        }
      });

      // Save to local storage
      const local = getLocalMedia();
      const editIndex = local.edited.findIndex((m) => String(m.id) === String(media.id));
      if (editIndex !== -1) local.edited[editIndex] = media;
      else local.edited.push(media);

      saveLocalMedia(local);
    },

    deleteMedia: (
      state,
      action: PayloadAction<{ id: string | number; type: 'trending' | 'movies' | 'tvShows' | 'customMovies' }>
    ) => {
      const { id, type } = action.payload;
      state[type] = state[type].filter((m) => String(m.id) !== String(id));
      state.trending = state.trending.filter((m) => String(m.id) !== String(id));
      
      const local = getLocalMedia();
      local.deleted.push(id);
      saveLocalMedia(local);
    },
  },
  extraReducers: (builder) => {
    const mergeWithLocal = (fetched: Media[], type: 'trending' | 'movies' | 'tvShows') => {
      const local = getLocalMedia();
      
      const localItems = local[type].map(
        (m) => local.edited.find((e) => String(e.id) === String(m.id)) || m
      );

      let merged = fetched.filter((m) => !local.deleted.includes(m.id));
      merged = merged.map((m) => local.edited.find((e) => String(e.id) === String(m.id)) || m);
      
      return [...localItems, ...merged];
    };

    builder
      .addCase(getTrending.pending, (state) => { state.status.trending = 'loading'; })
      .addCase(getTrending.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.trending = 'succeeded';
        state.trending = mergeWithLocal(action.payload, 'trending');
      })
      .addCase(getTrending.rejected, (state) => { state.status.trending = 'failed'; })
      .addCase(getMovies.pending, (state) => { state.status.movies = 'loading'; })
      .addCase(getMovies.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.movies = 'succeeded';
        state.movies = mergeWithLocal(action.payload, 'movies');
      })
      .addCase(getMovies.rejected, (state) => { state.status.movies = 'failed'; })
      .addCase(getTVShows.pending, (state) => { state.status.tvShows = 'loading'; })
      .addCase(getTVShows.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.tvShows = 'succeeded';
        state.tvShows = mergeWithLocal(action.payload, 'tvShows');
      })
      .addCase(getTVShows.rejected, (state) => { state.status.tvShows = 'failed'; })
      .addCase(searchMediaThunk.pending, (state) => { state.status.searchResults = 'loading'; })
      .addCase(searchMediaThunk.fulfilled, (state, action: PayloadAction<Media[]>) => {
        state.status.searchResults = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchMediaThunk.rejected, (state) => { state.status.searchResults = 'failed'; });
  },
});

export const { addMedia, editMedia, deleteMedia } = mediaSlice.actions;
export default mediaSlice.reducer;