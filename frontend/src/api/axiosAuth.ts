import axios from 'axios';
import { store } from '../store/store'; // Adjust path to your Redux store
import { setCredentials, logout } from '../features/auth/authSlice';

const axiosAuth = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending the HttpOnly refresh cookie
});

// Request Interceptor: Attach Access Token
axiosAuth.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Expired Tokens
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Ask backend for a new access token
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        
        const newAccessToken = response.data.accessToken;
        
        // Update Redux with new token
        store.dispatch(setCredentials({ 
          user: store.getState().auth.user, 
          accessToken: newAccessToken 
        }));

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosAuth(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired), log them out completely
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosAuth;