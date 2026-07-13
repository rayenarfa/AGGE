import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle silent token refreshing on access token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Silent token refresh call directly using standard axios to avoid circular interceptor triggers
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, propagate the error (user session expired)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
