import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOTPRequest
} from '../types/auth';const API_BASE_URL = 'http://localhost:3000/api/v1'; // Thay đổi URL này theo API server của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refresh_token: string) => {
    const response = await api.post('/auth/refresh', { refresh_token });
    return response.data;
  },

  // Đăng xuất
  logout: async (refresh_token: string) => {
    const response = await api.post('/auth/logout', { refresh_token });
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // Xác nhận OTP
  verifyOTP: async (data: VerifyOTPRequest) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export default api;
