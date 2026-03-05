import { configureStore } from '@reduxjs/toolkit';
import mediaReducer from '../features/media/mediaSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';

export const store = configureStore({
  reducer: {
    media: mediaReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;