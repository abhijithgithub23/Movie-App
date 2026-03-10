// src/features/favorites/favoritesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
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
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;