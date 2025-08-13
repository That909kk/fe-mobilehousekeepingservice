export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone_number: string;
  roles: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  roles: string;
}

export interface User {
  account_id: number;
  username: string;
  roles: string;
  status: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}
