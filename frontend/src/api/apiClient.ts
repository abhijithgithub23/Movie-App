import axios from 'axios';
import { store } from '../store/store'; 
import { setCredentials, logoutUser } from '../features/auth/authSlice'; 

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, 
});

// Request Interceptor: Attach Access Token if it exists
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  // If the user is logged in, attach the token. If not, just send normally.
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Expired Tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        
        const newAccessToken = response.data.accessToken;
        const currentUser = response.data.user || store.getState().auth.user; 
        
        store.dispatch(setCredentials({ 
          user: currentUser, 
          accessToken: newAccessToken 
        }));

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logoutUser());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;