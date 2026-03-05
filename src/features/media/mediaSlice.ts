import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tmdbApi } from '../../api/tmdb';
import type { Media } from '../../types';
// Helper to get local data
const getLocalMedia = (): { added: Media[], edited: Media[], deleted: (string|number)[] } => {
  const data = localStorage.getItem('customMedia');
  return data ? JSON.parse(data) : { added: [], edited: [], deleted: [] };
};

// Helper to save local data
const saveLocalMedia = (data: any) => {
  localStorage.setItem('customMedia', JSON.stringify(data));
};

export const getTrending = createAsyncThunk('media/getTrending', async () => {
  const response = await tmdbApi.get('/trending/all/day');
  return response.data.results;
});

interface MediaState {
  trending: Media[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MediaState = {
  trending: [],
  status: 'idle',
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    addMedia: (state, action: PayloadAction<Media>) => {
      const newMedia = { ...action.payload, id: `custom-${Date.now()}`, isCustom: true };
      state.trending.unshift(newMedia); // Add to top of store
      
      const local = getLocalMedia();
      local.added.push(newMedia);
      saveLocalMedia(local);
    },
    editMedia: (state, action: PayloadAction<Media>) => {
      const index = state.trending.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.trending[index] = action.payload;
      }
      
      const local = getLocalMedia();
      const editIndex = local.edited.findIndex(m => m.id === action.payload.id);
      if (editIndex !== -1) local.edited[editIndex] = action.payload;
      else local.edited.push(action.payload);
      saveLocalMedia(local);
    },
    deleteMedia: (state, action: PayloadAction<number | string>) => {
      state.trending = state.trending.filter(m => m.id !== action.payload);
      
      const local = getLocalMedia();
      local.deleted.push(action.payload);
      saveLocalMedia(local);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrending.pending, (state) => { state.status = 'loading'; })
      .addCase(getTrending.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const local = getLocalMedia();
        
        // 1. Filter out deleted items
        let mergedData = action.payload.filter((m: Media) => !local.deleted.includes(m.id));
        
        // 2. Apply edits to existing TMDB data
        mergedData = mergedData.map((m: Media) => {
          const editedItem = local.edited.find(edit => edit.id === m.id);
          return editedItem ? editedItem : m;
        });

        // 3. Append custom added media
        state.trending = [...local.added, ...mergedData];
      });
  },
});

export const { addMedia, editMedia, deleteMedia } = mediaSlice.actions;
export default mediaSlice.reducer;