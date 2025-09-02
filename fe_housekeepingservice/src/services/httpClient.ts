import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Tạo instance axios chung
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor để thêm token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý errors và auto refresh token
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            
            // Update tokens in storage
            const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
            storage.setItem('accessToken', accessToken);
            storage.setItem('refreshToken', newRefreshToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            // Retry the original request
            return httpClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // If refresh fails or no refresh token, clear storage and redirect to login
      ['accessToken', 'refreshToken', 'userRole', 'deviceType', 'userData', 'rememberMe'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Redirect to login page
      window.location.href = '/login';
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.get(url, config);
  },

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.post(url, data, config);
  },

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.put(url, data, config);
  },

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.patch(url, data, config);
  },

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return httpClient.delete(url, config);
  },
};

export default httpClient;
