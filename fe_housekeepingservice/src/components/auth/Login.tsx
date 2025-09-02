import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { permissionService } from '../../services/permissionService';
// import { useUserPermissions } from '../../shared/hooks/useUserPermissions'; // Removed - not needed
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';
import LanguageSwitcher from '../../shared/components/LanguageSwitcher';
import { getRoleId } from '../../utils/roleMapping';
import type { UserRole } from '../../types/auth';

interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('login', language);
  // const { setPermissions } = useUserPermissions(); // Removed - not needed anymore
  
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    
    if (!form.username.trim()) {
      newErrors.username = getNestedValue(staticData, 'messages.validation.username_required', 'Username is required');
    }
    
    if (!form.password) {
      newErrors.password = getNestedValue(staticData, 'messages.validation.password_required', 'Password is required');
    } else if (form.password.length < 6) {
      newErrors.password = getNestedValue(staticData, 'messages.validation.password_min_length', 'Password must be at least 6 characters');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // First, get user roles
      const roleResponse = await authService.getRoles(form.username.trim(), form.password);
      
      if (!roleResponse.success) {
        setErrors({
          general: roleResponse.message || getNestedValue(staticData, 'messages.login_error', 'Login failed. Please check your credentials.')
        });
        return;
      }

      const roles = roleResponse.data;
      const activeRoles = Object.entries(roles)
        .filter(([, status]) => status === 'ACTIVE')
        .map(([role]) => role);

      // Check if user has any active roles
      if (activeRoles.length === 0) {
        setErrors({
          general: getNestedValue(staticData, 'messages.account_inactive', 'Tài khoản hiện không hoạt động. Vui lòng liên hệ hỗ trợ để mở lại.')
        });
        return;
      }

      // If user has exactly one active role, login directly with that role
      if (activeRoles.length === 1) {
        const selectedRole = activeRoles[0];
        
        const loginResponse = await authService.login({
          username: form.username.trim(),
          password: form.password,
          role: selectedRole as UserRole,
          deviceType: 'WEB',
          rememberMe: form.rememberMe
        });
        
        if (loginResponse.success && loginResponse.data?.accessToken) {
          // Lấy roleId từ mapping
          const roleId = getRoleId(selectedRole);
          
          if (roleId) {
            // Lưu roleId vào storage
            const storage = form.rememberMe ? localStorage : sessionStorage;
            storage.setItem('roleId', roleId.toString());
            
            try {
              // Fetch permissions với roleId
              const permissionsResponse = await permissionService.getRoleDetail(roleId);
              
              // Lưu role data vào localStorage để sử dụng trong app
              if (permissionsResponse.success && permissionsResponse.data && permissionsResponse.data.length > 0) {
                const roleData = permissionsResponse.data[0];
                storage.setItem('userRoleData', JSON.stringify(roleData));
                
                // Navigate to dashboard - useUserPermissions sẽ tự động load permissions
                navigate('/dashboard');
                return; // Early return để tránh navigate 2 lần
              }
            } catch (permissionError) {
              console.error('Failed to fetch permissions:', permissionError);
              // Vẫn navigate đến dashboard, useUserPermissions sẽ retry
              navigate('/dashboard');
              return;
            }
          }
          
          navigate('/dashboard');
        } else {
          setErrors({
            general: loginResponse.message || getNestedValue(staticData, 'messages.login_error', 'Đăng nhập thất bại')
          });
        }
      } else {
        // If user has multiple active roles, navigate to role selection
        navigate('/role-selector', {
          state: {
            username: form.username.trim(),
            password: form.password,
            rememberMe: form.rememberMe
          }
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : getNestedValue(staticData, 'messages.login_error', 'Login failed. Please check your credentials.');
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      // Simulate Google OAuth flow
      // TODO: Implement actual Google OAuth integration
      setTimeout(() => {
        setErrors({
          general: getNestedValue(staticData, 'messages.google_error', 'Google sign in failed. Please try again.')
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : getNestedValue(staticData, 'messages.google_error', 'Google sign in failed. Please try again.');
      setErrors({
        general: errorMessage
      });
      setIsSubmitting(false);
    }
  };

  if (staticLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Add fallback if staticData fails to load
  if (!staticData) {
    console.warn('Static data failed to load, using fallbacks');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
          {/* Decorative patterns */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
          
          {/* Content */}
          <div className="relative flex flex-col justify-center h-full px-12 text-white">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">
                {language === 'vi' ? 'Chào mừng trở lại!' : 'Welcome Back!'}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {language === 'vi' 
                  ? 'Đăng nhập để tiếp tục sử dụng dịch vụ dọn dẹp nhà cửa chuyên nghiệp của chúng tôi.'
                  : 'Sign in to continue using our professional housekeeping services.'
                }
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100">
                  {language === 'vi' ? 'Dịch vụ đáng tin cậy' : 'Reliable Service'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100">
                  {language === 'vi' ? 'Nhân viên chuyên nghiệp' : 'Professional Staff'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100">
                  {language === 'vi' ? 'Giá cả hợp lý' : 'Affordable Pricing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative">
        {/* Language Switcher */}
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Sign In')}
            </h1>
            <p className="text-gray-600">
              {getNestedValue(staticData, 'subtitle', 'Welcome back')}
            </p>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="flex-shrink-0 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          )}



          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {getNestedValue(staticData, 'form.username.label', 'Username')}
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                  placeholder={getNestedValue(staticData, 'form.username.placeholder', 'Enter your username')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {getNestedValue(staticData, 'form.password.label', 'Password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                  placeholder={getNestedValue(staticData, 'form.password.placeholder', 'Enter your password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {getNestedValue(staticData, 'actions.remember_me', 'Remember me')}
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
              >
                {getNestedValue(staticData, 'actions.forgot_password', 'Forgot password?')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getNestedValue(staticData, 'actions.logging_in', 'Signing in...')}
                </>
              ) : (
                getNestedValue(staticData, 'actions.login', 'Sign In')
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {getNestedValue(staticData, 'divider.text', 'Or continue with')}
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {getNestedValue(staticData, 'actions.google_login', 'Sign in with Google')}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              {getNestedValue(staticData, 'messages.no_account', "Don't have an account?")}{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                {getNestedValue(staticData, 'messages.register_link', 'Sign up')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
