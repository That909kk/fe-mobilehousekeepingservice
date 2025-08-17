import { httpClient } from './httpClient';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyOTPRequest,
  RefreshTokenResponse,
  SessionResponse,
  ApiResponse
} from '../types/auth';

class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse['data']>> {
    return await httpClient.post('/auth/login', credentials);
  }

  // Register
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse['data']>> {
    return await httpClient.post('/auth/register', userData);
  }

  // Verify OTP (for registration or password reset)
  async verifyOTP(otpData: VerifyOTPRequest): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/verify-otp', otpData);
  }

  // Resend OTP
  async resendOTP(email: string): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/resend-otp', { email });
  }

  // Forgot Password
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/forgot-password', forgotData);
  }

  // Reset Password
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/reset-password', resetData);
  }

  // Change Password
  async changePassword(changeData: ChangePasswordRequest): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/change-password', changeData);
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse['data']>> {
    return await httpClient.post('/auth/refresh-token', { refreshToken });
  }

  // Get Current Session
  async getCurrentSession(): Promise<ApiResponse<SessionResponse['data']>> {
    return await httpClient.get('/auth/session');
  }

  // Logout
  async logout(): Promise<ApiResponse<any>> {
    return await httpClient.post('/auth/logout');
  }

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<ApiResponse<{ available: boolean }>> {
    return await httpClient.get(`/auth/check-username/${username}`);
  }

  // Check email availability
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return await httpClient.get(`/auth/check-email/${email}`);
  }
}

export const authService = new AuthService();
