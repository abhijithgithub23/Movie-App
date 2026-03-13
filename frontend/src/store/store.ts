import { configureStore } from "@reduxjs/toolkit";
import mediaReducer from "../features/media/mediaSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const mediaPersistConfig = {
  key: "media",
  storage,
  whitelist: ["customMovies", "edited", "deleted"],
};

const favoritesPersistConfig = {
  key: "favorites",
  storage,
  whitelist: ["items"],
};

const persistedMediaReducer = persistReducer(mediaPersistConfig, mediaReducer);
const persistedFavoritesReducer = persistReducer(favoritesPersistConfig, favoritesReducer);

export const store = configureStore({
  reducer: {
    media: persistedMediaReducer,
    favorites: persistedFavoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;