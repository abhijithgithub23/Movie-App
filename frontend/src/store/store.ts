import { configureStore } from "@reduxjs/toolkit";
import mediaReducer from "../features/media/mediaSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import authReducer from '../features/auth/authSlice'; 

export const store = configureStore({
  reducer: {
    media: mediaReducer,
    favorites: favoritesReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;