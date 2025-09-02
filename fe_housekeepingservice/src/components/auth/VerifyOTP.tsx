import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { VerifyOTPRequest } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';

const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('verify-otp', language);
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây
  const [canResend, setCanResend] = useState(false);
  
  // Refs cho các input OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Đếm ngược thời gian
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Return loading state if static data is still loading
  if (staticLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Chỉ cho phép 1 ký tự

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Xóa lỗi khi user bắt đầu nhập
    if (errors.otp) {
      setErrors(prev => ({
        ...prev,
        otp: ''
      }));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Chuyển về ô trước khi nhấn Backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOtp = pastedData.slice(0, 6).split('');
    
    const newOtp = [...otp];
    pastedOtp.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    
    // Focus vào ô cuối cùng có giá trị
    let lastFilledIndex = -1;
    for (let i = newOtp.length - 1; i >= 0; i--) {
      if (newOtp[i] !== '') {
        lastFilledIndex = i;
        break;
      }
    }
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      newErrors.otp = 'Vui lòng nhập đầy đủ 6 số';
    } else if (!/^\d{6}$/.test(otpString)) {
      newErrors.otp = 'OTP chỉ được chứa số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const otpString = otp.join('');
      const verifyData: VerifyOTPRequest = {
        email,
        otp: otpString
      };

      await authService.verifyOTP(verifyData);
      
      // Chuyển đến trang đặt lại mật khẩu
      navigate('/reset-password', { state: { email, otp: otpString } });
    } catch (error: unknown) {
      setErrors({
        general: error instanceof Error ? error.message : 'Mã OTP không chính xác. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setCountdown(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      alert('Mã OTP mới đã được gửi đến email của bạn!');
    } catch (error: unknown) {
      setErrors({
        general: error instanceof Error ? error.message : 'Gửi lại OTP thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-auth p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Xác nhận OTP')}
            </h1>
            <p className="text-gray-600 mb-2">
              {getNestedValue(staticData, 'subtitle', 'Nhập mã xác nhận đã được gửi đến')}
            </p>
            <p className="text-primary-600 font-semibold">{email}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center animate-slide-up">
                {errors.general}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {getNestedValue(staticData, 'form.otp_instruction', 'Nhập mã gồm 6 chữ số')}
              </p>
            </div>

            <div className="flex justify-center space-x-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
                    errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]"
                />
              ))}
            </div>

            {errors.otp && (
              <div className="text-center text-sm text-red-600">
                {errors.otp}
              </div>
            )}

            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-600">
                  Gửi lại mã sau: <span className="font-bold text-primary-600">{formatTime(countdown)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 underline"
                  disabled={isLoading}
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? getNestedValue(staticData, 'actions.verifying', 'Đang xác nhận...') : getNestedValue(staticData, 'actions.verify', 'Xác nhận')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              <Link 
                to="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                {getNestedValue(staticData, 'messages.back_to_login', 'Quay lại đăng nhập')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
