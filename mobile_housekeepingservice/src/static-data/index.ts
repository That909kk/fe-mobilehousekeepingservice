// Import all static data files
import loginData from './pages/login.json';
import registerData from './pages/register.json';
import forgotPasswordData from './pages/forgot-password.json';
import verifyOtpData from './pages/verify-otp.json';
import resetPasswordData from './pages/reset-password.json';
import changePasswordData from './pages/change-password.json';
import dashboardData from './pages/dashboard.json';
import termsConditionsData from './terms_conditions.json';

// Create a registry of all static data
export const staticDataRegistry = {
  'login': loginData,
  'register': registerData,
  'forgot-password': forgotPasswordData,
  'verify-otp': verifyOtpData,
  'reset-password': resetPasswordData,
  'change-password': changePasswordData,
  'dashboard': dashboardData,
  'terms_conditions': termsConditionsData,
} as const;

export type StaticDataPageName = keyof typeof staticDataRegistry;
