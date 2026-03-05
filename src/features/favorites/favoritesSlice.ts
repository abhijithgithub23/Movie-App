// ✅ Correct pattern
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'; // runtime
import type { PayloadAction } from '@reduxjs/toolkit';              // type-only
import type { Media } from '../../types';                           // type-only

interface FavoritesState {
  items: Media[];
}

const loadFavorites = (): Media[] => {
  const data = localStorage.getItem('userFavorites');
  return data ? JSON.parse(data) : [];
};

const initialState: FavoritesState = {
  items: loadFavorites(),
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<Media>) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1); // Remove if exists
      } else {
        state.items.push(action.payload); // Add if not
      }
      localStorage.setItem('userFavorites', JSON.stringify(state.items));
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;