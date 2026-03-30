import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // FIX 1: Type-only import
import axios from 'axios';

const AUTH_URL = 'http://localhost:5000/api/auth';

// --- INTERFACES (FIX 2: Replacing 'any' with strict types) ---
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

// We use Record<string, string> here to allow simple object passing from the form
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
      // Safely check if the error is an Axios error to access error.response
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

// Add this new Thunk
export const checkAuth = createAsyncThunk<AuthResponse, void>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Hit the refresh endpoint to see if we have a valid HTTP-only cookie
      const response = await axios.post<AuthResponse>(`${AUTH_URL}/refresh`, {}, { withCredentials: true });
      return response.data; // Returns { user, accessToken }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Session expired');
      }
      return rejectWithValue('An unexpected error occurred');
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
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
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

    // Handle Check Auth (On App Load)
    builder.addCase(checkAuth.pending, (state) => {
      // We use 'loading' here so we can show a spinner in App.tsx while checking
      state.status = 'loading'; 
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      // If it fails (no cookie, expired), we just silently fail and stay logged out
      state.status = 'idle'; 
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;