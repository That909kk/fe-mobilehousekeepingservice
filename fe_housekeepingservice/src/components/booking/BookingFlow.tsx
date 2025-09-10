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

// Progressive Step Configuration
const BOOKING_STEPS = [
  {
    id: 'service' as BookingStep,
    title: 'Chọn Dịch Vụ',
    description: 'Lựa chọn dịch vụ phù hợp',
    icon: '🏡',
    color: 'blue',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600'
  },
  {
    id: 'location' as BookingStep,
    title: 'Thông Tin Địa Điểm',
    description: 'Nhập địa chỉ phục vụ',
    icon: '📍',
    color: 'green',
    gradient: 'from-green-600 via-emerald-600 to-teal-600'
  },
  {
    id: 'datetime' as BookingStep,
    title: 'Chọn Thời Gian',
    description: 'Đặt lịch phù hợp',
    icon: '⏰',
    color: 'purple',
    gradient: 'from-purple-600 via-pink-600 to-rose-600'
  },
  {
    id: 'confirmation' as BookingStep,
    title: 'Xác Nhận Đặt Dịch Vụ',
    description: 'Hoàn tất đặt dịch vụ',
    icon: '✅',
    color: 'orange',
    gradient: 'from-orange-600 via-amber-600 to-yellow-600'
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

  // Service icon mapping
  const getServiceIcon = (serviceName: string | undefined) => {
    if (!serviceName || typeof serviceName !== 'string') return '🏡';
    const name = serviceName.toLowerCase();
    if (name.includes('dọn dẹp')) return '🧹';
    if (name.includes('tổng vệ sinh')) return '✨';
    if (name.includes('giặt')) return '👕';
    if (name.includes('nấu ăn')) return '👨‍🍳';
    if (name.includes('máy lạnh')) return '❄️';
    if (name.includes('sofa')) return '🛋️';
    if (name.includes('cửa kính')) return '🪟';
    return '🏡';
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
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4">
            {BOOKING_STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStepIndex > index;
              const canNavigate = canNavigateToStep(index);
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => canNavigate ? goToStep(step.id) : null}
                    disabled={!canNavigate}
                    className={`group relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform ${
                      isActive 
                        ? `bg-${step.color}-600 text-white ring-4 ring-${step.color}-200 scale-110 shadow-lg` 
                        : isCompleted 
                        ? 'bg-green-500 text-white hover:scale-105 cursor-pointer shadow-md' 
                        : canNavigate
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-105 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                    
                    {/* Tooltip */}
                    <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 ${
                      !canNavigate ? 'hidden' : ''
                    }`}>
                      <div className="text-center">
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-gray-300">{step.description}</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                  
                  {index < BOOKING_STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <span className="text-3xl">{currentStepConfig?.icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {currentStepConfig?.title}
              </h2>
            </div>
            <p className="text-gray-600">{currentStepConfig?.description}</p>
            
            {/* Progress Percentage */}
            <div className="mt-4 bg-gray-200 rounded-full h-2 max-w-md mx-auto">
              <div 
                className={`bg-gradient-to-r ${currentStepConfig?.gradient} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${((currentStepIndex + 1) / BOOKING_STEPS.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Bước {currentStepIndex + 1} / {BOOKING_STEPS.length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Service Selection Step
  const renderServiceSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <InteractiveProgressBar />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${currentStepConfig?.gradient} px-8 py-16 text-white`}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-7xl mb-6 animate-bounce">{currentStepConfig?.icon}</div>
                <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                  {currentStepConfig?.title}
                </h1>
                <p className="text-xl sm:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {currentStepConfig?.description} - Chúng tôi cung cấp dịch vụ gia đình chuyên nghiệp với chất lượng hàng đầu
                </p>
              </div>
            </div>

            <div className="p-8 lg:p-12">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col justify-center items-center py-24">
                  <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-primary-200"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-700 mb-2">{t.messages.loading}</p>
                    <p className="text-gray-500">Đang tải danh sách dịch vụ chất lượng cho bạn...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-2xl p-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-bold text-red-800 mb-2">⚠️ {t.messages.error}</h3>
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

              {/* Categories Section */}
              {!loading && categories.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">🏷️ {t.categories.title}</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 max-w-4xl mx-auto">
                      <div className="flex items-center justify-center">
                        <div className="text-5xl mr-4">📋</div>
                        <div className="text-left">
                          <p className="text-blue-800 text-lg font-semibold mb-2">{t.messages.apiNote}</p>
                          <p className="text-blue-600 text-sm">Bạn có thể xem qua các danh mục để hiểu rõ hơn về dịch vụ của chúng tôi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categories.map(category => (
                      <div 
                        key={category.categoryId} 
                        className="group bg-gradient-to-br from-white via-gray-50 to-blue-50 border-2 border-gray-200 rounded-3xl p-8 text-center hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                      >
                        <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500">
                          {getServiceIcon(category.categoryName)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                          {category.categoryName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                        <span className="inline-flex items-center px-5 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 text-blue-800 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                          {category.serviceCount} {t.categories.serviceCount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Grid */}
              {!loading && !error && services.length > 0 && (
                <div>
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">⭐ Dịch Vụ Chất Lượng Cao</h2>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                      Chọn dịch vụ phù hợp nhất với nhu cầu của gia đình bạn. Tất cả đều được thực hiện bởi đội ngũ chuyên nghiệp.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map(service => {
                      const isSelected = bookingData.selectedService?.serviceId === service.serviceId;
                      
                      return (
                        <div 
                          key={service.serviceId} 
                          onClick={() => handleServiceSelect(service)}
                          className={`group cursor-pointer bg-white border-3 rounded-3xl overflow-hidden transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                            isSelected 
                              ? 'border-primary-500 ring-6 ring-primary-200 shadow-2xl scale-105 bg-gradient-to-br from-primary-50 to-blue-50' 
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-blue-100'
                          }`}
                        >
                          {/* Service Header */}
                          <div className={`p-8 relative ${isSelected ? 'bg-gradient-to-br from-primary-50 to-blue-100' : 'bg-white'}`}>
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-5xl group-hover:scale-125 transition-transform duration-500">
                                {getServiceIcon(getServiceName(service))}
                              </div>
                              {isSelected && (
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <h3 className={`text-2xl font-bold mb-4 ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                              {getServiceName(service)}
                            </h3>
                            
                            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                              {service.description}
                            </p>
                          </div>

                          {/* Service Details */}
                          <div className="px-8 pb-8">
                            <div className="space-y-5">
                              {/* Price */}
                              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                                <span className="text-sm font-semibold text-gray-600 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  💰 {t.info.price}:
                                </span>
                                <span className={`text-xl font-bold ${isSelected ? 'text-primary-600' : 'text-green-600'}`}>
                                  {service.price && typeof service.price === 'number' 
                                    ? `${service.price.toLocaleString('vi-VN')}đ`
                                    : t.info.contact
                                  }
                                </span>
                              </div>
                              
                              {/* Unit & Duration */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4 text-center border">
                                  <div className="text-xs text-gray-500 mb-1 font-medium">📏 {t.info.unit}</div>
                                  <div className="text-lg font-bold text-gray-900">{service.unit}</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 text-center border">
                                  <div className="text-xs text-gray-500 mb-1 font-medium">⏱️ {t.info.duration}</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {Math.round((service.duration || 0) / 60)} {t.info.hours}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button className={`w-full mt-8 py-5 px-6 rounded-2xl font-bold transition-all duration-300 text-lg shadow-lg ${
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

              {/* Empty State */}
              {!loading && !error && services.length === 0 && (
                <div className="text-center py-24">
                  <div className="max-w-lg mx-auto">
                    <div className="text-9xl mb-8 animate-bounce">🏠</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">{t.messages.noServices}</h3>
                    <p className="text-gray-500 mb-10 text-xl leading-relaxed">{t.messages.noServicesDesc}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-10 py-5 border border-transparent text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <svg className="mr-3 h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      🔄 {t.buttons.retry}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t-2 border-gray-200">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full sm:w-auto inline-flex items-center px-10 py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  🏠 {t.buttons.backToDashboard}
                </button>
                
                {services.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Hiển thị {services.length} dịch vụ</span>
                    <button 
                      onClick={() => setError(null)} 
                      className="w-full sm:w-auto inline-flex items-center px-10 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
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

  // Location Step with enhanced UX
  const renderLocationStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <InteractiveProgressBar />
      
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${BOOKING_STEPS[1].gradient} px-8 py-16 text-white`}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-7xl mb-6 animate-pulse">{BOOKING_STEPS[1].icon}</div>
                <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                  {BOOKING_STEPS[1].title}
                </h1>
                <p className="text-xl sm:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {BOOKING_STEPS[1].description} - Chúng tôi sẽ đến tận nơi phục vụ bạn
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 lg:p-12">
              {/* Selected Service Info */}
              {bookingData.selectedService && (
                <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{getServiceIcon(getServiceName(bookingData.selectedService))}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dịch vụ đã chọn:</h3>
                      <p className="text-blue-700 font-semibold">{getServiceName(bookingData.selectedService)}</p>
                      <p className="text-green-600 font-bold">{bookingData.selectedService.price?.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Options */}
              <div className="space-y-6">
                {/* Default Address Option */}
                {defaultAddress && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                          🏠 {t.buttons?.useDefault || 'Địa chỉ mặc định'}
                        </h3>
                        <p className="text-gray-700 mb-1">{defaultAddress.fullAddress}</p>
                        <p className="text-sm text-gray-500">{defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}</p>
                      </div>
                      <button
                        onClick={useDefaultAddress}
                        className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        {t.buttons?.select || 'Chọn'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Address Input */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    📝 {t.buttons?.addNew || 'Nhập địa chỉ mới'}
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-xl font-bold text-gray-700 mb-4">
                        🏠 {t.form.address}
                        <span className="text-red-500 ml-2">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t.form.addressPlaceholder}
                        className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                        value={bookingData.location?.address || ''}
                        onChange={(e) => updateBookingData({
                          location: { ...bookingData.location, address: e.target.value }
                        })}
                      />
                      <p className="text-sm text-gray-500 mt-2">💡 Vui lòng nhập địa chỉ chi tiết để chúng tôi có thể phục vụ bạn tốt nhất</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="flex items-center text-xl font-bold text-gray-700 mb-4">
                          🏘️ {t.form.district}
                        </label>
                        <input
                          type="text"
                          placeholder={t.form.districtPlaceholder}
                          className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                          value={bookingData.location?.district || ''}
                          onChange={(e) => updateBookingData({
                            location: { ...bookingData.location, district: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-xl font-bold text-gray-700 mb-4">
                          🌆 {t.form.city}
                        </label>
                        <input
                          type="text"
                          placeholder={t.form.cityPlaceholder}
                          className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                          value={bookingData.location?.city || ''}
                          onChange={(e) => updateBookingData({
                            location: { ...bookingData.location, city: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-between gap-6">
                <button
                  onClick={goToPreviousStep}
                  className="w-full sm:w-auto px-10 py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  ← {t.buttons.previous}
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!validateCurrentStep()}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t.buttons.next} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // DateTime Step with enhanced time slot selection
  const renderDateTimeStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <InteractiveProgressBar />
      
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${BOOKING_STEPS[2].gradient} px-8 py-16 text-white`}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="text-7xl mb-6 animate-spin">{BOOKING_STEPS[2].icon}</div>
                <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                  {BOOKING_STEPS[2].title}
                </h1>
                <p className="text-xl sm:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                  {BOOKING_STEPS[2].description} - Chọn thời gian phù hợp với lịch trình của bạn
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 lg:p-12">
              {/* Previous Steps Summary */}
              <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">🏡 Dịch vụ đã chọn:</h3>
                  <p className="text-blue-700 font-semibold">{getServiceName(bookingData.selectedService)}</p>
                  <p className="text-green-600 font-bold">{bookingData.selectedService?.price?.toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">📍 Địa chỉ phục vụ:</h3>
                  <p className="text-green-700 font-semibold">{bookingData.location?.address}</p>
                  <p className="text-gray-600">{bookingData.location?.district}, {bookingData.location?.city}</p>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <label className="flex items-center text-xl font-bold text-gray-700 mb-4">
                    📅 {t.form.date}
                    <span className="text-red-500 ml-2">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                    value={bookingData.dateTime?.date || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateBookingData({
                      dateTime: { ...bookingData.dateTime, date: e.target.value }
                    })}
                  />
                  <p className="text-sm text-gray-500 mt-2">💡 Chúng tôi phục vụ từ thứ 2 đến chủ nhật, từ 7:00 AM đến 6:00 PM</p>
                </div>
                
                <div>
                  <label className="flex items-center text-xl font-bold text-gray-700 mb-6">
                    ⏰ {t.form.time}
                    <span className="text-red-500 ml-2">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {t.timeSlots.map((slot: any) => (
                      <button
                        key={slot.value}
                        onClick={() => updateBookingData({
                          dateTime: { ...bookingData.dateTime, timeSlot: slot.value }
                        })}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-lg font-bold shadow-md hover:shadow-lg ${
                          bookingData.dateTime?.timeSlot === slot.value
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 transform scale-105 shadow-xl'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-105'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">
                            {slot.value.startsWith('08') || slot.value.startsWith('09') || slot.value.startsWith('10') || slot.value.startsWith('11') ? '🌅' : '🌤️'}
                          </div>
                          <div>{slot.label}</div>
                        </div>
                        {bookingData.dateTime?.timeSlot === slot.value && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-between gap-6">
                <button
                  onClick={goToPreviousStep}
                  className="w-full sm:w-auto px-10 py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  ← {t.buttons.previous}
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={!validateCurrentStep()}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t.buttons.next} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Confirmation Step with enhanced summary
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <InteractiveProgressBar />
        
        <div className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${BOOKING_STEPS[3].gradient} px-8 py-16 text-white`}>
                <div className="text-center max-w-4xl mx-auto">
                  <div className="text-7xl mb-6 animate-bounce">{BOOKING_STEPS[3].icon}</div>
                  <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                    {BOOKING_STEPS[3].title}
                  </h1>
                  <p className="text-xl sm:text-2xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                    {BOOKING_STEPS[3].description} - Chỉ còn một bước nữa để hoàn tất!
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-8 lg:p-12">
                <div className="space-y-10">
                  {/* Complete Booking Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-3xl p-8 shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                      <span className="text-3xl mr-4">📋</span>
                      Chi Tiết Đặt Dịch Vụ
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Service Details */}
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            🏡 Thông tin dịch vụ
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Dịch vụ:</span>
                              <span className="font-semibold text-gray-900">{getServiceName(bookingData.selectedService)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Đơn vị:</span>
                              <span className="font-semibold text-gray-900">{bookingData.selectedService?.unit}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Thời gian thực hiện:</span>
                              <span className="font-semibold text-gray-900">
                                {Math.round((bookingData.selectedService?.duration || 0) / 60)} giờ
                              </span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-3">
                              <span className="text-gray-600 text-lg font-semibold">Tổng giá:</span>
                              <span className="text-2xl font-bold text-green-600">
                                {bookingData.selectedService?.price?.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location & Time Details */}
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            📍 Địa điểm & Thời gian
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-600 block mb-1">Địa chỉ:</span>
                              <span className="font-semibold text-gray-900">{bookingData.location?.address}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block mb-1">Khu vực:</span>
                              <span className="font-semibold text-gray-900">
                                {bookingData.location?.district}, {bookingData.location?.city}
                              </span>
                            </div>
                            <div className="border-t pt-3">
                              <span className="text-gray-600 block mb-1">Thời gian phục vụ:</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">📅</span>
                                <span className="font-semibold text-gray-900 text-lg">
                                  {bookingData.dateTime?.date} lúc {bookingData.dateTime?.timeSlot}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      💳 {t.labels?.paymentMethod || 'Phương thức thanh toán'}
                      <span className="text-red-500 ml-2">*</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {t.paymentMethods?.map((method: any) => (
                        <button
                          key={method.id}
                          onClick={() => updateBookingData({ paymentMethodId: method.id })}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                            bookingData.paymentMethodId === method.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xl transform scale-105'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-lg mb-2">{method.name}</h4>
                              <p className={`text-sm ${
                                bookingData.paymentMethodId === method.id ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {method.description}
                              </p>
                            </div>
                            {bookingData.paymentMethodId === method.id && (
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      )) || (
                        <div className="p-6 bg-white rounded-2xl border-2 border-gray-200">
                          <h4 className="font-bold text-lg mb-2">Thanh toán tiền mặt</h4>
                          <p className="text-sm text-gray-600">Thanh toán trực tiếp khi hoàn thành dịch vụ</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="flex items-center text-xl font-bold text-gray-700 mb-4">
                      💬 {t.form.specialRequests}
                    </label>
                    <textarea
                      placeholder={t.form.specialRequestsPlaceholder}
                      rows={4}
                      className="w-full px-8 py-6 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 text-lg resize-none shadow-md hover:shadow-lg"
                      value={bookingData.specialRequests || ''}
                      onChange={(e) => updateBookingData({ specialRequests: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 mt-2">💡 Bạn có thể ghi thêm những yêu cầu đặc biệt để chúng tôi phục vụ tốt hơn</p>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">📋 Điều khoản dịch vụ</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Nhân viên sẽ đến đúng thời gian đã hẹn</li>
                      <li>• Chúng tôi cam kết chất lượng dịch vụ và sự hài lòng của khách hàng</li>
                      <li>• Bạn có thể hủy hoặc thay đổi lịch hẹn trước 2 giờ</li>
                      <li>• Mọi thiết bị và dụng cụ làm việc sẽ được chuẩn bị sẵn sàng</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row justify-between gap-6">
                  <button
                    onClick={goToPreviousStep}
                    className="w-full sm:w-auto px-10 py-5 border-2 border-gray-300 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                  >
                    ← {t.buttons.previous}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading || !validateCurrentStep()}
                    className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-bold transition-all duration-300 text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                      loading || !validateCurrentStep()
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
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
                      <>🎉 {t.buttons.confirm}</>
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
