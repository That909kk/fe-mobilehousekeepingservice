// Enums for better type safety
export type UserRole = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
export type RegistrationRole = 'CUSTOMER' | 'EMPLOYEE'; // Only allow these roles for registration
export type DeviceType = 'WEB' | 'MOBILE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

// Login related interfaces
export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
  deviceType: DeviceType;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expireIn: number;
    role: UserRole;
    roleId?: number; // Thêm roleId
    deviceType: DeviceType;
    data: CustomerData | EmployeeData | AdminData;
  };
}

// Register related interfaces
export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: RegistrationRole; // Use RegistrationRole instead of UserRole
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    username: string;
    email: string;
    role: UserRole;
  };
}

// User data interfaces for different roles
export interface CustomerData {
  customerId: string;
  username: string;
  avatar?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isMale: boolean;
  status: UserStatus;
  address: string;
}

export interface EmployeeData {
  employeeId: string;
  username: string;
  avatar?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isMale: boolean;
  status: UserStatus;
  address: string;
}

export interface AdminData {
  adminId: string;
  username: string;
  fullName: string;
  isMale: boolean;
  address: string;
  department: string;
  contactInfo: string;
  hireDate: string;
}

// Password related interfaces
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Token and session interfaces
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expireIn: number;
  };
}

export interface SessionData {
  webSessions: number;
  mobileSessions: number;
}

export interface SessionResponse {
  success: boolean;
  data: SessionData;
}

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
