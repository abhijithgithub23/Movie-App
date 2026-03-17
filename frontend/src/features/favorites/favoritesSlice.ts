// src/features/favorites/favoritesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { deleteMedia } from '../media/mediaSlice'; // 1. Import the delete action
import type { Media } from '../../types';

interface FavoritesState {
  items: Media[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<Media>) => {
      // Comparison using ID - ensure both are treated as same type (string/number)
      const existingIndex = state.items.findIndex(
        (item) => String(item.id) === String(action.payload.id)
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        // Unshift adds to the beginning, so [].reverse() in UI is cleaner
        state.items.push(action.payload);
      }
    },
  },
  // 2. Add extraReducers to intercept actions from other slices
  extraReducers: (builder) => {
    builder.addCase(deleteMedia, (state, action) => {
      // action.payload is the ID of the deleted media. 
      // We filter it out of the favorites array automatically!
      state.items = state.items.filter(
        (item) => String(item.id) !== String(action.payload)
      );
    });
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;