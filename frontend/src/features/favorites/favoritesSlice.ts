import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiClient from '../../api/apiClient';
import { deleteMedia } from '../media/mediaSlice';
// Import the auth actions so we can listen for them
import { logoutUser, checkAuth } from '../auth/authSlice'; 
import type { Media } from '../../types';

interface FavoritesState {
  items: Media[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: FavoritesState = {
  items: [],
  status: 'idle',
};

// Fetch all favorites from the DB when the user visits the Favorites page
export const fetchFavorites = createAsyncThunk<Media[]>(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/favorites');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to load favorites');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Toggle a favorite in the DB
export const toggleFavoriteAsync = createAsyncThunk<{ added: boolean, media: Media }, Media>(
  'favorites/toggleFavorite',
  async (media, { rejectWithValue }) => {
    try {
      // Only send the ID to the backend! No more massive payloads.
      const response = await apiClient.post('/favorites/toggle', { id: media.id });
      
      // We still return the full 'media' object here so Redux can instantly update your UI
      return { added: response.data.added, media };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update favorite');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // --- FAVORITES ACTIONS ---
    builder.addCase(fetchFavorites.pending, (state) => { state.status = 'loading'; });
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload; 
    });
    builder.addCase(fetchFavorites.rejected, (state) => { state.status = 'failed'; });

    builder.addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
      const { added, media } = action.payload;
      if (added) {
        state.items.unshift(media);
      } else {
        state.items = state.items.filter((item) => String(item.id) !== String(media.id)); 
      }
    });

    builder.addCase(deleteMedia, (state, action) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
    });

    // --- AUTHENTICATION ACTIONS (THE BUG FIX) ---
    // If the user logs out successfully OR if the logout fails, wipe the favorites.
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.items = [];
      state.status = 'idle';
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.items = [];
      state.status = 'idle';
    });

    // If checkAuth fails (e.g., their cookie expired while they were away), wipe the favorites.
    builder.addCase(checkAuth.rejected, (state) => {
      state.items = [];
      state.status = 'idle';
    });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;