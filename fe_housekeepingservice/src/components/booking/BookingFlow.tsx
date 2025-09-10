import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { serviceService } from '../../services/serviceService';
import { bookingService } from '../../services/bookingService';
import type { Service, ServiceCategory } from '../../types/service';
import bookingFlowData from '../../static-data/pages/booking-flow.json';

const t = bookingFlowData.vi;

export type BookingStep = 'service' | 'location' | 'datetime' | 'confirmation';

export interface SimpleBookingData {
  selectedService?: Service;
  quantity?: number;
  location?: {
    addressId?: string;
    address?: string;
    district?: string;
    city?: string;
  };
  dateTime?: {
    date?: string;
    timeSlot?: string;
  };
  specialRequests?: string;
  paymentMethodId?: number;
}

// Progressive Step Configuration với cải thiện UI/UX
const BOOKING_STEPS = [
  {
    id: 'service' as BookingStep,
    title: 'Chọn Dịch Vụ',
    description: 'Lựa chọn dịch vụ phù hợp',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bgPattern: 'from-blue-50 via-indigo-50 to-purple-50'
  },
  {
    id: 'location' as BookingStep,
    title: 'Thông Tin Địa Điểm',
    description: 'Nhập địa chỉ phục vụ',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    color: 'green',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    bgPattern: 'from-green-50 via-emerald-50 to-teal-50'
  },
  {
    id: 'datetime' as BookingStep,
    title: 'Chọn Thời Gian',
    description: 'Đặt lịch phù hợp',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
      </svg>
    ),
    color: 'purple',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    bgPattern: 'from-purple-50 via-pink-50 to-rose-50'
  },
  {
    id: 'confirmation' as BookingStep,
    title: 'Xác Nhận Đặt Dịch Vụ',
    description: 'Hoàn tất đặt dịch vụ',
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    ),
    color: 'orange',
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    bgPattern: 'from-orange-50 via-amber-50 to-yellow-50'
  }
];

const BookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [bookingData, setBookingData] = useState<SimpleBookingData>({});
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  
  const t = bookingFlowData.vi;
  const currentStepConfig = BOOKING_STEPS.find(step => step.id === currentStep);
  const currentStepIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);

  // Service icon mapping với SVG icons chuyên nghiệp
  const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName || typeof serviceName !== 'string') {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      );
    }
    
    const name = serviceName.toLowerCase();
    
    if (name.includes('dọn dẹp')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          <path d="M12 6l-2 2-2-2 2-2z" opacity="0.5"/>
        </svg>
      );
    }
    
    if (name.includes('tổng vệ sinh')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
    
    if (name.includes('giặt')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.17 16.83c1.56 1.56 4.1 1.56 5.66 0 1.56-1.56 1.56-4.1 0-5.66l-5.66 5.66zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      );
    }
    
    if (name.includes('nấu ăn')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
        </svg>
      );
    }
    
    if (name.includes('máy lạnh')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 3H2v3h20V3zM13 8.5c0-.83-.67-1.5-1.5-1.5S10 7.67 10 8.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7zM20 19H4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1z"/>
        </svg>
      );
    }
    
    if (name.includes('sofa')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h2c0 .55.45 1 1 1s1-.45 1-1h12c0 .55.45 1 1 1s1-.45 1-1h2v-5c0-1.1-.9-2-2-2z"/>
        </svg>
      );
    }
    
    if (name.includes('cửa kính')) {
      return (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5v14h14V5H5zm12 12H7V7h10v10z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    }
    
    // Default home service icon
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    );
  };
  
  // Helper function to safely get service name from service object
  const getServiceName = (service: any) => {
    return service?.serviceName || service?.name || '';
  };

  // Helper function to transform ApiService to Service format
  const transformApiServiceToService = (apiService: any): Service => {
    return {
      serviceId: apiService.serviceId?.toString() || apiService.serviceId,
      serviceName: apiService.name || apiService.serviceName || '',
      description: apiService.description || '',
      price: apiService.basePrice || apiService.price || 0,
      unit: apiService.unit || 'package',
      duration: apiService.estimatedDurationHours || apiService.duration || 0,
      categoryId: apiService.categoryId || '',
      categoryName: apiService.categoryName || '',
      status: apiService.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: apiService.createdAt || '',
      updatedAt: apiService.updatedAt || ''
    };
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [categoriesResponse, servicesResponse] = await Promise.all([
          categoryService.getAllCategories(),
          serviceService.getAllServices()
        ]);
        
        if (categoriesResponse?.success && categoriesResponse?.data) {
          setCategories(categoriesResponse.data);
        }

        if (servicesResponse?.success && servicesResponse?.data) {
          // Transform API response to Service format
          const transformedServices = servicesResponse.data.map(transformApiServiceToService);
          setServices(transformedServices);
        } else {
          setError(t.messages?.noServices || 'Không thể tải danh sách dịch vụ');
        }
      } catch (error) {
        setError(t.messages?.loading || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load default address when moving to location step
  useEffect(() => {
    if (currentStep === 'location' && !defaultAddress) {
      loadDefaultAddress();
    }
  }, [currentStep]);

  const updateBookingData = (newData: Partial<SimpleBookingData>) => {
    setBookingData(prev => ({ ...prev, ...newData }));
  };

  // Load default address for customer
  const loadDefaultAddress = async () => {
    try {
      setLoadingAddress(true);
      // Get customer ID from localStorage or session storage
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      const currentUser = JSON.parse(storage.getItem('currentUser') || '{}');
      
      if (currentUser?.customerId) {
        const response: any = await bookingService.getCustomerDefaultAddress(currentUser.customerId);
        if (response?.success && response?.data) {
          setDefaultAddress(response.data);
        }
      }
    } catch (error) {
      console.log('No default address found');
    } finally {
      setLoadingAddress(false);
    }
  };

  // Use default address
  const useDefaultAddress = () => {
    if (defaultAddress) {
      updateBookingData({
        location: {
          addressId: defaultAddress.addressId,
          address: defaultAddress.fullAddress,
          district: defaultAddress.district,
          city: defaultAddress.city
        }
      });
    }
  };

  // Validation functions
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'service':
        return !!bookingData.selectedService;
      case 'location':
        return !!(bookingData.location?.address && bookingData.location?.district && bookingData.location?.city);
      case 'datetime':
        return !!(bookingData.dateTime?.date && bookingData.dateTime?.timeSlot);
      case 'confirmation':
        return !!(bookingData.paymentMethodId);
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 'service':
        return t.messages?.selectService || 'Vui lòng chọn dịch vụ';
      case 'location':
        return t.messages?.selectAddress || 'Vui lòng nhập đầy đủ thông tin địa chỉ';
      case 'datetime':
        return t.messages?.selectDateTime || 'Vui lòng chọn ngày và giờ';
      case 'confirmation':
        return 'Vui lòng chọn phương thức thanh toán';
      default:
        return 'Vui lòng hoàn tất thông tin';
    }
  };

  const goToStep = (stepId: BookingStep) => {
    setCurrentStep(stepId);
  };

  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      alert(getValidationMessage());
      return;
    }
    
    const currentIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < BOOKING_STEPS.length - 1) {
      setCurrentStep(BOOKING_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(BOOKING_STEPS[currentIndex - 1].id);
    }
  };

  const handleServiceSelect = (service: Service) => {
    updateBookingData({ selectedService: service });
    goToNextStep();
  };

  // Enhanced Interactive Progress Bar Component
  const InteractiveProgressBar = () => {
    const canNavigateToStep = (stepIndex: number) => {
      switch (stepIndex) {
        case 0: return true; // Service selection always accessible
        case 1: return !!bookingData.selectedService; // Location needs service
        case 2: return !!bookingData.selectedService && !!bookingData.location?.address; // DateTime needs service + location
        case 3: return !!bookingData.selectedService && !!bookingData.location?.address && !!bookingData.dateTime?.date && !!bookingData.dateTime?.timeSlot; // Confirmation needs all
        default: return false;
      }
    };

    return (
      <div className="bg-white shadow-2xl border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Mobile Progress Indicator */}
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">{currentStepConfig?.title}</h2>
              <span className="text-sm text-gray-500">
                {currentStepIndex + 1}/{BOOKING_STEPS.length}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${currentStepConfig?.gradient} h-2 rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${((currentStepIndex + 1) / BOOKING_STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Desktop Progress Steps */}
          <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4 mb-4">
            {BOOKING_STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStepIndex > index;
              const canNavigate = canNavigateToStep(index);
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => canNavigate ? goToStep(step.id) : null}
                    disabled={!canNavigate}
                    className={`group relative w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                      isActive 
                        ? `bg-gradient-to-br ${step.gradient} text-white ring-4 ring-${step.color}-200 scale-110 shadow-2xl animate-pulse` 
                        : isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl' 
                        : canNavigate
                        ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 hover:from-gray-300 hover:to-gray-400 hover:scale-110 cursor-pointer shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="relative z-10">
                      {isCompleted ? '✓' : index + 1}
                    </span>
                    
                    {/* Ripple Effect */}
                    {isActive && (
                      <span className={`absolute inset-0 rounded-full bg-${step.color}-400 animate-ping opacity-20`}></span>
                    )}
                    
                    {/* Enhanced Tooltip */}
                    <div className={`absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-2xl ${
                      !canNavigate ? 'hidden' : ''
                    }`}>
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-1">{step.title}</div>
                        <div className="text-gray-300 text-xs">{step.description}</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                  
                  {index < BOOKING_STEPS.length - 1 && (
                    <div className={`w-6 lg:w-16 h-1 mx-1 lg:mx-2 transition-all duration-700 rounded-full ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-md' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

            {/* Enhanced Current Step Info */}
            <div className="hidden md:block text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600 animate-bounce">
                  {currentStepConfig?.icon}
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {currentStepConfig?.title}
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base">{currentStepConfig?.description}</p>
                </div>
              </div>            {/* Enhanced Progress Percentage */}
            <div className="mt-4 bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden shadow-inner">
              <div 
                className={`bg-gradient-to-r ${currentStepConfig?.gradient} h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative`}
                style={{ width: `${((currentStepIndex + 1) / BOOKING_STEPS.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Bước {currentStepIndex + 1} / {BOOKING_STEPS.length} - {Math.round(((currentStepIndex + 1) / BOOKING_STEPS.length) * 100)}% hoàn thành
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Service Selection Step
  const renderServiceSelection = () => (
    <div className={`min-h-screen bg-gradient-to-br ${currentStepConfig?.bgPattern} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-indigo-400 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <InteractiveProgressBar />
      
      <div className="py-4 lg:py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Enhanced Header */}
            <div className={`bg-gradient-to-r ${currentStepConfig?.gradient} px-6 lg:px-8 py-12 lg:py-16 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="text-center max-w-4xl mx-auto relative z-10">
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 text-white animate-bounce filter drop-shadow-lg">
                  {currentStepConfig?.icon}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 tracking-tight">
                  {currentStepConfig?.title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {currentStepConfig?.description} - Chúng tôi cung cấp dịch vụ gia đình chuyên nghiệp với chất lượng hàng đầu
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            </div>

            <div className="p-6 lg:p-12">
              {/* Enhanced Loading State */}
              {loading && (
                <div className="flex flex-col justify-center items-center py-24">
                  <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-700 mb-2">{t.messages.loading}</p>
                    <p className="text-gray-500">Đang tải danh sách dịch vụ chất lượng cho bạn...</p>
                    <div className="mt-4 flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Error State */}
              {error && (
                <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-2xl p-6 lg:p-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                        </svg>
                        {t.messages.error}
                      </h3>
                      <p className="text-red-700 mb-4 leading-relaxed">{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t.buttons.retry}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Categories Section */}
              {!loading && categories.length > 0 && (
                <div className="mb-12 lg:mb-16">
                  <div className="text-center mb-8 lg:mb-10">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center justify-center">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                      </svg>
                      {t.categories.title}
                    </h2>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 mr-4 text-blue-600">
                          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-blue-800 text-base lg:text-lg font-semibold mb-2">{t.messages.apiNote}</p>
                          <p className="text-blue-600 text-sm">Bạn có thể xem qua các danh mục để hiểu rõ hơn về dịch vụ của chúng tôi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {categories.map((category, index) => (
                      <div 
                        key={category.categoryId} 
                        className="group bg-gradient-to-br from-white via-gray-50 to-blue-50 border-2 border-gray-200 rounded-3xl p-6 lg:p-8 text-center hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-12 h-12 lg:w-16 lg:h-16 mb-4 lg:mb-6 group-hover:scale-125 transition-transform duration-500 text-blue-600 mx-auto">
                          {getServiceIcon(category.categoryName)}
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-blue-700 transition-colors">
                          {category.categoryName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 lg:mb-6 leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                        <span className="inline-flex items-center px-4 lg:px-5 py-2 lg:py-3 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-800 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                          {category.serviceCount} {t.categories.serviceCount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Services Grid */}
              {!loading && !error && services.length > 0 && (
                <div>
                  <div className="text-center mb-8 lg:mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Dịch Vụ Chất Lượng Cao
                    </h2>
                    <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                      Chọn dịch vụ phù hợp nhất với nhu cầu của gia đình bạn. Tất cả đều được thực hiện bởi đội ngũ chuyên nghiệp.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {services.map((service, index) => {
                      const isSelected = bookingData.selectedService?.serviceId === service.serviceId;
                      
                      return (
                        <div 
                          key={service.serviceId} 
                          onClick={() => handleServiceSelect(service)}
                          className={`group cursor-pointer bg-white border-3 rounded-3xl overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl animate-fade-in-up ${
                            isSelected 
                              ? 'border-primary-500 ring-4 ring-primary-200 shadow-2xl scale-105 bg-gradient-to-br from-primary-50 to-blue-50' 
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-blue-100'
                          }`}
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          {/* Enhanced Service Header */}
                          <div className={`p-6 lg:p-8 relative ${isSelected ? 'bg-gradient-to-br from-primary-50 to-blue-100' : 'bg-white'}`}>
                            <div className="flex items-center justify-between mb-6">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 group-hover:scale-125 transition-transform duration-500 text-blue-600">
                                {getServiceIcon(getServiceName(service))}
                              </div>
                              {isSelected && (
                                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <h3 className={`text-xl lg:text-2xl font-bold mb-4 ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                              {getServiceName(service)}
                            </h3>
                            
                            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 text-sm lg:text-base">
                              {service.description}
                            </p>
                          </div>

                          {/* Enhanced Service Details */}
                          <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                            <div className="space-y-4 lg:space-y-5">
                              {/* Enhanced Price Display */}
                              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                                <span className="text-sm font-semibold text-gray-600 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                                  </svg>
                                  Giá dịch vụ:
                                </span>
                                <span className={`text-lg lg:text-xl font-bold ${isSelected ? 'text-primary-600' : 'text-green-600'}`}>
                                  {service.price && typeof service.price === 'number' 
                                    ? `${service.price.toLocaleString('vi-VN')}đ`
                                    : t.info.contact
                                  }
                                </span>
                              </div>
                              
                              {/* Enhanced Unit & Duration Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4 text-center border hover:bg-gray-100 transition-colors">
                                  <div className="text-xs text-gray-500 mb-1 font-medium flex items-center justify-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                                    </svg>
                                    {t.info.unit}
                                  </div>
                                  <div className="text-base lg:text-lg font-bold text-gray-900">{service.unit}</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 text-center border hover:bg-gray-100 transition-colors">
                                  <div className="text-xs text-gray-500 mb-1 font-medium flex items-center justify-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    </svg>
                                    {t.info.duration}
                                  </div>
                                  <div className="text-base lg:text-lg font-bold text-gray-900">
                                    {Math.round((service.duration || 0) / 60)} {t.info.hours}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Action Button */}
                            <button className={`w-full mt-6 lg:mt-8 py-4 lg:py-5 px-6 rounded-2xl font-bold transition-all duration-300 text-base lg:text-lg shadow-lg ${
                              isSelected 
                                ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:from-primary-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl transform hover:scale-105' 
                                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-primary-100 hover:to-blue-100 hover:text-primary-700 group-hover:from-primary-500 group-hover:to-blue-500 group-hover:text-white hover:shadow-xl'
                            }`}>
                              {isSelected ? `🎉 ${t.buttons.selected} ✓` : `🚀 ${t.buttons.selectService}`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced Empty State */}
              {!loading && !error && services.length === 0 && (
                <div className="text-center py-24">
                  <div className="max-w-lg mx-auto">
                    <div className="text-6xl lg:text-7xl mb-8 animate-bounce text-green-600">
                      <svg className="mx-auto" width="120" height="120" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{t.messages.noServices}</h3>
                    <p className="text-gray-500 mb-10 text-lg lg:text-xl leading-relaxed">{t.messages.noServicesDesc}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-8 lg:px-10 py-4 lg:py-5 border border-transparent text-lg lg:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <svg className="mr-3 h-6 lg:h-7 w-6 lg:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      🔄 {t.buttons.retry}
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Navigation */}
              <div className="mt-12 lg:mt-16 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t-2 border-gray-200">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full sm:w-auto inline-flex items-center px-8 lg:px-10 py-4 lg:py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg"
                >
                  <svg className="mr-3 h-5 lg:h-6 w-5 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  {t.buttons.backToDashboard}
                </button>
                
                {services.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Hiển thị {services.length} dịch vụ</span>
                    <button 
                      onClick={() => setError(null)} 
                      className="w-full sm:w-auto inline-flex items-center px-8 lg:px-10 py-4 lg:py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg"
                    >
                      <span className="mr-3">📋</span>
                      {t.messages.displayAll}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Location Step with improved UX
  const renderLocationStep = () => (
    <div className={`min-h-screen bg-gradient-to-br ${BOOKING_STEPS[1].bgPattern} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-24 h-24 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-emerald-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-teal-400 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <InteractiveProgressBar />
      
      <div className="py-4 lg:py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Enhanced Header */}
            <div className={`bg-gradient-to-r ${BOOKING_STEPS[1].gradient} px-6 lg:px-8 py-12 lg:py-16 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="text-center max-w-4xl mx-auto relative z-10">
                <div className="text-6xl lg:text-7xl mb-6 animate-pulse filter drop-shadow-lg">{BOOKING_STEPS[1].icon}</div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 tracking-tight">
                  {BOOKING_STEPS[1].title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {BOOKING_STEPS[1].description} - Chúng tôi sẽ đến tận nơi phục vụ bạn
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Enhanced Form */}
            <div className="p-6 lg:p-12">
              {/* Selected Service Info with Animation */}
              {bookingData.selectedService && (
                <div className="mb-8 lg:mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 lg:p-8 animate-fade-in-up">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl lg:text-4xl animate-bounce">{getServiceIcon(getServiceName(bookingData.selectedService))}</div>
                    <div className="flex-1">
                      <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Dịch vụ đã chọn:
                      </h3>
                      <p className="text-blue-700 font-semibold text-base lg:text-lg">{getServiceName(bookingData.selectedService)}</p>
                      <p className="text-green-600 font-bold text-base lg:text-lg">{bookingData.selectedService.price?.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="hidden sm:block text-2xl lg:text-3xl animate-spin-slow text-blue-600">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Address Options */}
              <div className="space-y-6 lg:space-y-8">
                {/* Default Address Option with Loading State */}
                {loadingAddress ? (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 lg:p-8">
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600 font-medium">Đang tải địa chỉ mặc định...</span>
                    </div>
                  </div>
                ) : defaultAddress ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 lg:p-8 animate-fade-in-up hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                          </svg>
                          {t.buttons?.useDefault || 'Địa chỉ mặc định'}
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Khuyến nghị</span>
                        </h3>
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium text-base lg:text-lg">{defaultAddress.fullAddress}</p>
                          <p className="text-sm lg:text-base text-gray-500">{defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}</p>
                        </div>
                      </div>
                      <button
                        onClick={useDefaultAddress}
                        className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {t.buttons?.select || 'Chọn'}
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Enhanced Manual Address Input */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    {t.buttons?.addNew || 'Nhập địa chỉ mới'}
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Tùy chỉnh</span>
                  </h3>
                  
                  <div className="space-y-6 lg:space-y-8">
                    {/* Enhanced Address Input */}
                    <div className="group">
                      <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-4">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                        {t.form.address}
                        <span className="text-red-500 ml-2">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t.form.addressPlaceholder}
                          className="w-full px-6 lg:px-8 py-4 lg:py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg group-hover:border-green-300 bg-white/90 backdrop-blur-sm"
                          value={bookingData.location?.address || ''}
                          onChange={(e) => updateBookingData({
                            location: { ...bookingData.location, address: e.target.value }
                          })}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <div className="text-gray-400 group-focus-within:text-green-500 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <span className="mr-2">
                          <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </span>
                        Vui lòng nhập địa chỉ chi tiết để chúng tôi có thể phục vụ bạn tốt nhất
                      </p>
                    </div>
                    
                    {/* Enhanced District & City Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                      {/* District Input */}
                      <div className="group">
                        <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-4">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          {t.form.district}
                          <span className="text-red-500 ml-2">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t.form.districtPlaceholder}
                            className="w-full px-6 lg:px-8 py-4 lg:py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg group-hover:border-green-300 bg-white/90 backdrop-blur-sm"
                            value={bookingData.location?.district || ''}
                            onChange={(e) => updateBookingData({
                              location: { ...bookingData.location, district: e.target.value }
                            })}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <div className="text-gray-400 group-focus-within:text-green-500 transition-colors">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* City Input */}
                      <div className="group">
                        <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-4">
                          🌆 {t.form.city}
                          <span className="text-red-500 ml-2">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t.form.cityPlaceholder}
                            className="w-full px-6 lg:px-8 py-4 lg:py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg group-hover:border-green-300 bg-white/90 backdrop-blur-sm"
                            value={bookingData.location?.city || ''}
                            onChange={(e) => updateBookingData({
                              location: { ...bookingData.location, city: e.target.value }
                            })}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <div className="text-gray-400 group-focus-within:text-green-500 transition-colors">
                              🌆
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Tips */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 lg:p-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">
                      <svg className="w-6 h-6 inline" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </span>
                    Gợi ý địa chỉ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500">•</span>
                      <span>Bao gồm số nhà, tên đường cụ thể</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500">•</span>
                      <span>Ghi rõ tên tòa nhà, chung cư (nếu có)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500">•</span>
                      <span>Đảm bảo địa chỉ trong phạm vi phục vụ</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500">•</span>
                      <span>Có thể liên hệ để xác nhận địa chỉ</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Navigation */}
              <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row justify-between gap-6">
                <button
                  onClick={goToPreviousStep}
                  className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <span className="mr-2">←</span> {t.buttons.previous}
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!validateCurrentStep()}
                  className={`w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-bold transition-all duration-300 text-base lg:text-lg shadow-lg hover:shadow-xl transform focus:outline-none focus:ring-2 ${
                    validateCurrentStep()
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105 focus:ring-green-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {t.buttons.next} <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced DateTime Step with improved time slot selection
  const renderDateTimeStep = () => (
    <div className={`min-h-screen bg-gradient-to-br ${BOOKING_STEPS[2].bgPattern} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-10 w-28 h-28 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-rose-400 rounded-full animate-pulse delay-2000"></div>
      </div>
      
      <InteractiveProgressBar />
      
      <div className="py-4 lg:py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Enhanced Header */}
            <div className={`bg-gradient-to-r ${BOOKING_STEPS[2].gradient} px-6 lg:px-8 py-12 lg:py-16 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="text-center max-w-4xl mx-auto relative z-10">
                <div className="text-6xl lg:text-7xl mb-6 animate-spin filter drop-shadow-lg">{BOOKING_STEPS[2].icon}</div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 tracking-tight">
                  {BOOKING_STEPS[2].title}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {BOOKING_STEPS[2].description} - Chọn thời gian phù hợp với lịch trình của bạn
                </p>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Enhanced Form */}
            <div className="p-6 lg:p-12">
              {/* Enhanced Previous Steps Summary */}
              <div className="mb-8 lg:mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 lg:p-8 animate-fade-in-up">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 flex items-center">
                    🏡 Dịch vụ đã chọn:
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓</span>
                  </h3>
                  <p className="text-blue-700 font-semibold text-base lg:text-lg">{getServiceName(bookingData.selectedService)}</p>
                  <p className="text-green-600 font-bold text-base lg:text-lg">{bookingData.selectedService?.price?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 lg:p-8 animate-fade-in-up">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 flex items-center">
                    📍 Địa chỉ phục vụ:
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓</span>
                  </h3>
                  <p className="text-green-700 font-semibold text-base lg:text-lg">{bookingData.location?.address}</p>
                  <p className="text-gray-600 text-sm lg:text-base">{bookingData.location?.district}, {bookingData.location?.city}</p>
                </div>
              </div>

              <div className="space-y-8 lg:space-y-10">
                {/* Enhanced Date Selection */}
                <div className="group">
                  <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-4 lg:mb-6">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    {t.form.date}
                    <span className="text-red-500 ml-2">*</span>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Bắt buộc</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-6 lg:px-8 py-4 lg:py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg group-hover:border-purple-300 bg-white/90 backdrop-blur-sm"
                      value={bookingData.dateTime?.date || ''}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => updateBookingData({
                        dateTime: { ...bookingData.dateTime, date: e.target.value }
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <div className="text-gray-400 group-focus-within:text-purple-500 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Chúng tôi phục vụ từ thứ 2 đến chủ nhật, từ 7:00 AM đến 6:00 PM
                  </p>
                </div>
                
                {/* Enhanced Time Slot Selection */}
                <div>
                  <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-6 lg:mb-8">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {t.form.time}
                    <span className="text-red-500 ml-2">*</span>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Chọn khung giờ</span>
                  </label>
                  
                  {/* Time Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {t.timeSlots.map((slot: any, index: number) => {
                      const isSelected = bookingData.dateTime?.timeSlot === slot.value;
                      const hour = parseInt(slot.value.split(':')[0]);
                      const isMorning = hour >= 8 && hour <= 11;
                      const isAfternoon = hour >= 13 && hour <= 17;
                      
                      return (
                        <button
                          key={slot.value}
                          onClick={() => updateBookingData({
                            dateTime: { ...bookingData.dateTime, timeSlot: slot.value }
                          })}
                          className={`group relative p-4 lg:p-6 rounded-2xl border-2 transition-all duration-500 text-base lg:text-lg font-bold shadow-md hover:shadow-lg animate-fade-in-up ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 transform scale-105 shadow-2xl ring-4 ring-purple-200'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-105'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="text-center">
                            <div className="text-xl lg:text-2xl mb-2">
                              {isMorning ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                                </svg>
                              ) : isAfternoon ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM1 10.5h3v2H1v-2zm11-4.19V3.5h2v2.81c1.85.67 3.2 2.43 3.2 4.5 0 2.21-1.79 4-4 4s-4-1.79-4-4c0-2.07 1.35-3.83 3.2-4.5zm1 7.69c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6.24-1.84l1.79-1.8 1.41 1.41-1.79 1.79-1.41-1.4zM20 10.5h3v2h-3v-2z"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9.37 5.51C9.19 6.15 9.1 6.82 9.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
                                </svg>
                              )}
                            </div>
                            <div className="font-bold">{slot.label}</div>
                            <div className={`text-xs mt-1 ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                              {isMorning ? 'Buổi sáng' : isAfternoon ? 'Buổi chiều' : 'Buổi tối'}
                            </div>
                          </div>
                          
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                              <svg className="w-3 h-3 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Hover Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isSelected ? 'hidden' : ''}`}></div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Time Selection Tips */}
                  <div className="mt-6 lg:mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 lg:p-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                          <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                      </span>
                      Lưu ý về thời gian
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">Buổi sáng (8-11h)</div>
                          <div>Thời gian phù hợp nhất</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM1 10.5h3v2H1v-2zm11-4.19V3.5h2v2.81c1.85.67 3.2 2.43 3.2 4.5 0 2.21-1.79 4-4 4s-4-1.79-4-4c0-2.07 1.35-3.83 3.2-4.5zm1 7.69c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6.24-1.84l1.79-1.8 1.41 1.41-1.79 1.79-1.41-1.4zM20 10.5h3v2h-3v-2z"/>
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">Buổi chiều (13-17h)</div>
                          <div>Có thể bận hơn một chút</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">Linh hoạt</div>
                          <div>Có thể điều chỉnh theo yêu cầu</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Navigation */}
              <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row justify-between gap-6">
                <button
                  onClick={goToPreviousStep}
                  className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <span className="mr-2">←</span> {t.buttons.previous}
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!validateCurrentStep()}
                  className={`w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-bold transition-all duration-300 text-base lg:text-lg shadow-lg hover:shadow-xl transform focus:outline-none focus:ring-2 ${
                    validateCurrentStep()
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 focus:ring-purple-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {t.buttons.next} <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Confirmation Step with comprehensive summary
  const renderConfirmationStep = () => {
    const handleConfirm = async () => {
      try {
        setLoading(true);
        
        // Debug logging để kiểm tra dữ liệu
        console.log('BookingFlow: bookingData before creating request:', bookingData);
        console.log('BookingFlow: selectedService:', bookingData.selectedService);
        console.log('BookingFlow: dateTime:', bookingData.dateTime);
        
        // Lấy serviceId từ selectedService - có thể là serviceId hoặc serviceId string
        const serviceId = bookingData.selectedService?.serviceId 
          ? (typeof bookingData.selectedService.serviceId === 'string' 
              ? parseInt(bookingData.selectedService.serviceId)
              : bookingData.selectedService.serviceId)
          : 0;
          
        // Lấy price từ selectedService
        const price = bookingData.selectedService?.price || 0;
        
        // Sử dụng addressId từ bookingData hoặc default
        const addressId = bookingData.location?.addressId || "adrs0001-0000-0000-0000-000000000001";
        
        const bookingRequest = {
          addressId: addressId,
          bookingTime: `${bookingData.dateTime?.date}T${bookingData.dateTime?.timeSlot}:00`,
          note: bookingData.specialRequests || '',
          promoCode: null,
          bookingDetails: [
            {
              serviceId: serviceId,
              quantity: bookingData.quantity || 1,
              expectedPrice: price,
              expectedPricePerUnit: price,
              selectedChoiceIds: []
            }
          ],
          assignments: [
            {
              serviceId: serviceId,
              employeeId: "e1000001-0000-0000-0000-000000000001"
            }
          ],
          paymentMethodId: bookingData.paymentMethodId || 1
        };
        
        console.log('BookingFlow: bookingRequest being sent:', bookingRequest);

        const result = await bookingService.createBooking(bookingRequest);
        
        if (result?.bookingId) {
          navigate('/booking/success', { 
            state: { bookingId: result.bookingId, bookingData, bookingResult: result }
          });
        } else {
          alert(t.messages?.bookingError || `Có lỗi xảy ra khi đặt dịch vụ: ${result?.message || 'Không nhận được bookingId'}`);
        }
      } catch (error: any) {
        console.error('BookingFlow: Error creating booking:', error);
        const errorMessage = error.response?.data?.message || error.message || t.messages?.bookingError || 'Vui lòng thử lại!';
        alert(`${t.messages?.bookingError || 'Có lỗi xảy ra khi đặt dịch vụ'}: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className={`min-h-screen bg-gradient-to-br ${BOOKING_STEPS[3].bgPattern} relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 right-16 w-32 h-32 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-amber-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-400 rounded-full animate-pulse delay-2000"></div>
        </div>
        
        <InteractiveProgressBar />
        
        <div className="py-4 lg:py-8 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              {/* Enhanced Header */}
              <div className={`bg-gradient-to-r ${BOOKING_STEPS[3].gradient} px-6 lg:px-8 py-12 lg:py-16 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="text-center max-w-4xl mx-auto relative z-10">
                  <div className="text-6xl lg:text-7xl mb-6 animate-bounce filter drop-shadow-lg">{BOOKING_STEPS[3].icon}</div>
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6 tracking-tight">
                    {BOOKING_STEPS[3].title}
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                    {BOOKING_STEPS[3].description} - Chỉ còn một bước nữa để hoàn tất!
                  </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
              </div>

              {/* Enhanced Summary */}
              <div className="p-6 lg:p-12">
                <div className="space-y-8 lg:space-y-10">
                  {/* Enhanced Complete Booking Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-3xl p-6 lg:p-8 shadow-lg animate-fade-in-up">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center">
                      <span className="text-3xl mr-4">📋</span>
                      Chi Tiết Đặt Dịch Vụ
                      <span className="ml-3 text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full">Xem lại</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      {/* Enhanced Service Details */}
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-lg transition-shadow">
                          <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
                            🏡 Thông tin dịch vụ
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Chi tiết</span>
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-600 font-medium">Dịch vụ:</span>
                              <span className="font-semibold text-gray-900 text-right flex-1 ml-4">{getServiceName(bookingData.selectedService)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-600 font-medium">Đơn vị:</span>
                              <span className="font-semibold text-gray-900">{bookingData.selectedService?.unit}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-600 font-medium">Thời gian thực hiện:</span>
                              <span className="font-semibold text-gray-900">
                                {Math.round((bookingData.selectedService?.duration || 0) / 60)} giờ
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-t-2 border-green-200">
                              <span className="text-gray-600 text-base lg:text-lg font-semibold flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                </svg>
                                Tổng giá:
                              </span>
                              <span className="text-xl lg:text-2xl font-bold text-green-600">
                                {bookingData.selectedService?.price?.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Location & Time Details */}
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-lg transition-shadow">
                          <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
                            📍 Địa điểm & Thời gian
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Đã xác nhận</span>
                          </h4>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-600 font-medium block mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                </svg>
                                Địa chỉ:
                              </span>
                              <span className="font-semibold text-gray-900">{bookingData.location?.address}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <span className="text-gray-600 font-medium block mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                Khu vực:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {bookingData.location?.district}, {bookingData.location?.city}
                              </span>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-t-2 border-purple-200">
                              <span className="text-gray-600 font-medium block mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                Thời gian phục vụ:
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                                  </svg>
                                </span>
                                <div>
                                  <div className="font-semibold text-gray-900 text-base lg:text-lg">
                                    {new Date(bookingData.dateTime?.date || '').toLocaleDateString('vi-VN', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-purple-600 font-bold">
                                    Lúc {bookingData.dateTime?.timeSlot}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Payment Method Selection */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 lg:p-8 animate-fade-in-up">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                      {t.labels?.paymentMethod || 'Phương thức thanh toán'}
                      <span className="text-red-500 ml-2">*</span>
                      <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Bắt buộc</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {t.paymentMethods?.map((method: any, index: number) => (
                        <button
                          key={method.id}
                          onClick={() => updateBookingData({ paymentMethodId: method.id })}
                          className={`p-6 lg:p-8 rounded-2xl border-2 transition-all duration-500 text-left hover:scale-105 animate-fade-in-up ${
                            bookingData.paymentMethodId === method.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xl transform scale-105 ring-4 ring-blue-200'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-md hover:shadow-lg'
                          }`}
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-base lg:text-lg mb-3 flex items-center">
                                <span className="text-xl mr-2">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                  </svg>
                                </span>
                                {method.name}
                              </h4>
                              <p className={`text-sm lg:text-base ${
                                bookingData.paymentMethodId === method.id ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {method.description}
                              </p>
                            </div>
                            {bookingData.paymentMethodId === method.id && (
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-bounce-in">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      )) || (
                        <div className="p-6 lg:p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-md">
                          <h4 className="font-bold text-base lg:text-lg mb-3 flex items-center">
                            <span className="text-xl mr-2">💵</span>
                            Thanh toán tiền mặt
                          </h4>
                          <p className="text-sm lg:text-base text-gray-600">Thanh toán trực tiếp khi hoàn thành dịch vụ</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Special Requests */}
                  <div className="animate-fade-in-up">
                    <label className="flex items-center text-lg lg:text-xl font-bold text-gray-700 mb-4 lg:mb-6">
                      💬 {t.form.specialRequests}
                      <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Tùy chọn</span>
                    </label>
                    <textarea
                      placeholder={t.form.specialRequestsPlaceholder}
                      rows={4}
                      className="w-full px-6 lg:px-8 py-4 lg:py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-base lg:text-lg resize-none shadow-md hover:shadow-lg bg-white/90 backdrop-blur-sm"
                      value={bookingData.specialRequests || ''}
                      onChange={(e) => updateBookingData({ specialRequests: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                      <span className="mr-2">
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </span>
                      Bạn có thể ghi thêm những yêu cầu đặc biệt để chúng tôi phục vụ tốt hơn
                    </p>
                  </div>

                  {/* Enhanced Terms and Conditions */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 lg:p-8 border border-gray-200 animate-fade-in-up">
                    <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
                      <span className="text-2xl mr-2">📋</span>
                      Điều khoản dịch vụ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm lg:text-base text-gray-600">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Nhân viên sẽ đến đúng thời gian đã hẹn</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>Cam kết chất lượng dịch vụ và sự hài lòng</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">ℹ</span>
                          <span>Có thể hủy hoặc thay đổi lịch hẹn trước 2 giờ</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">ℹ</span>
                          <span>Thiết bị và dụng cụ được chuẩn bị sẵn sàng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation */}
                <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row justify-between gap-6">
                  <button
                    onClick={goToPreviousStep}
                    className="w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-base lg:text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <span className="mr-2">←</span> {t.buttons.previous}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading || !validateCurrentStep()}
                    className={`w-full sm:w-auto px-10 lg:px-12 py-4 lg:py-5 rounded-2xl font-bold transition-all duration-300 text-lg lg:text-xl shadow-xl hover:shadow-2xl transform focus:outline-none focus:ring-2 ${
                      loading || !validateCurrentStep()
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105 focus:ring-green-500'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.messages.processing}...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">🎉</span>
                        {t.buttons.confirm}
                        <span className="ml-2">
                          <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'service':
        return renderServiceSelection();
      case 'location':
        return renderLocationStep();
      case 'datetime':
        return renderDateTimeStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return renderServiceSelection();
    }
  };

  return renderCurrentStep();
};

export default BookingFlow;
