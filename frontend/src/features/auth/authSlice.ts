import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; 
import axios from 'axios';

const AUTH_URL = 'http://localhost:5000/api/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  profile_pic: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type LoginCredentials = Record<string, string>;
export type RegisterCredentials = Record<string, string>;

// --- THUNKS ---
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login', 
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, credentials, { withCredentials: true });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/register', 
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_URL}/register`, userData, { withCredentials: true });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const checkAuth = createAsyncThunk<AuthResponse, void>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_URL}/refresh`, {}, { withCredentials: true });
      return response.data; 
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Session expired');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// NEW: Centralized Logout Thunk
export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
    } catch (error: unknown) {
      console.error("Backend logout failed", error);
      // We reject, but the extraReducers will STILL clear the local state for safety.
      return rejectWithValue('Server logout failed');
    }
  }
);

// --- SLICE ---
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User | null; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Handle Login
    builder.addCase(loginUser.pending, (state) => { 
      state.status = 'loading'; 
      state.error = null; 
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle Register
    builder.addCase(registerUser.pending, (state) => { 
      state.status = 'loading'; 
      state.error = null; 
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.status = 'loading'; 
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.status = 'idle'; 
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });

    // Handle Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = 'idle'; // Completely resetting the status
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Even if the server crashes, we kick them out on the frontend
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    });
  },
});

export const { setCredentials } = authSlice.actions; // Removed synchronous logout
export default authSlice.reducer;