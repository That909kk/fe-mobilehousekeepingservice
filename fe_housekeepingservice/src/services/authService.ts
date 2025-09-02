import { apiClient } from './httpClient';
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

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Lấy vai trò người dùng
  getRoles: async (username: string, password: string): Promise<{
    success: boolean;
    message: string;
    data: { [key: string]: string };
    roleNumbers: number;
  }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { [key: string]: string };
      roleNumbers: number;
    }>('/auth/get-role', {
      username,
      password
    });
    return response.data;
  },

  // Lấy danh sách roles có thể quản lý (để lấy roleId)
  getManageableRoles: async (): Promise<{
    success: boolean;
    message: string;
    data: Array<{ roleId: number; roleName: string }>;
  }> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: Array<{ roleId: number; roleName: string }>;
    }>('/admin/permissions/roles');
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest & { rememberMe?: boolean }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    const result = response.data;
    
    // Lưu tokens vào localStorage hoặc sessionStorage tùy theo rememberMe
    if (result.success && result.data) {
      const storage = data.rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('accessToken', result.data.accessToken);
      storage.setItem('refreshToken', result.data.refreshToken);
      storage.setItem('userRole', result.data.role);
      storage.setItem('deviceType', result.data.deviceType);
      storage.setItem('userData', JSON.stringify(result.data.data));
      storage.setItem('rememberMe', data.rememberMe ? 'true' : 'false');
      
      // Lưu roleId nếu có
      if (result.data.roleId) {
        storage.setItem('roleId', result.data.roleId.toString());
      }
    }
    
    return result;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
    const result = response.data;
    
    // Cập nhật tokens mới
    if (result.success && result.data) {
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      storage.setItem('accessToken', result.data.accessToken);
      storage.setItem('refreshToken', result.data.refreshToken);
    }
    
    return result;
  },

  // Đăng xuất
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    
    // Clear both local storage and session storage
    ['accessToken', 'refreshToken', 'userRole', 'roleId', 'deviceType', 'userData', 'userRoleData', 'rememberMe'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    return response.data;
  },

  // Lấy thông tin sessions đang hoạt động
  getActiveSessions: async (): Promise<SessionResponse> => {
    const response = await apiClient.get<SessionResponse>('/auth/sessions');
    return response.data;
  },

  // Validate token
  validateToken: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/auth/validate-token');
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // Xác nhận OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/verify-otp', data);
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/reset-password', data);
    return response.data;
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUserInfo: async (): Promise<{
    success: boolean;
    message: string;
    data: CustomerData | EmployeeData | AdminData;
  }> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: CustomerData | EmployeeData | AdminData;
    }>('/auth/user-info');
    return response.data;
  },

  // Cập nhật thông tin người dùng
  updateUserInfo: async (data: Partial<CustomerData | EmployeeData | AdminData>): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>('/auth/user-info', data);
    return response.data;
  },

  // Terminate session (logout từ thiết bị khác)
  terminateSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  // Terminate all sessions (logout từ tất cả thiết bị)
  terminateAllSessions: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>('/auth/sessions');
    return response.data;
  },

  // Utility functions
  getCurrentUser: (): CustomerData | EmployeeData | AdminData | null => {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getCurrentUserRole: (): string | null => {
    return localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
  },

  isAuthenticated: (): boolean => {
    return !!(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));
  },
};
