import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  CustomerData,
  EmployeeData,
  AdminData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOTPRequest,
  RefreshTokenResponse,
  SessionResponse,
  ApiResponse
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Clear current tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    const result = response.data;
    
    // Lưu tokens vào localStorage
    if (result.success && result.data) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      localStorage.setItem('userRole', result.data.role);
      localStorage.setItem('deviceType', result.data.deviceType);
      localStorage.setItem('userData', JSON.stringify(result.data.data));
    }
    
    return result;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const result = response.data;
    
    // Cập nhật tokens mới
    if (result.success && result.data) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
    }
    
    return result;
  },

  // Đăng xuất
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('deviceType');
    localStorage.removeItem('userData');
    
    return response.data;
  },

  // Lấy thông tin sessions đang hoạt động
  getActiveSessions: async (): Promise<SessionResponse> => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  // Validate token
  validateToken: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/validate-token');
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // Xác nhận OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // Utility functions
  getCurrentUser: (): CustomerData | EmployeeData | AdminData | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getCurrentUserRole: (): string | null => {
    return localStorage.getItem('userRole');
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};

export default api;
