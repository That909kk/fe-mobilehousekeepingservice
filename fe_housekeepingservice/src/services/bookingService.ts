import { apiClient } from './httpClient';

export interface BookingRequest {
  addressId: string;
  bookingTime: string;
  note: string;
  promoCode: string | null;
  bookingDetails: Array<{
    serviceId: number;
    quantity: number;
    expectedPrice: number;
    expectedPricePerUnit: number;
    selectedChoiceIds: number[];
  }>;
  assignments: Array<{
    serviceId: number;
    employeeId: string;
  }>;
  paymentMethodId: number;
}

export interface BookingResponse {
  bookingId: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  formattedTotalAmount: string;
  message?: string;
  [key: string]: any;
}

export interface UserBookingsResponse {
  success: boolean;
  message: string;
  data: Array<{
    bookingId: string;
    serviceId: string;
    serviceName: string;
    employeeId?: string;
    employeeName?: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    serviceDate: string;
    serviceTime: string;
    address: string;
    district: string;
    city: string;
    quantity: number;
    totalPrice: number;
    estimatedDuration: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    rating?: number;
    review?: string;
  }>;
}

export interface PriceCalculationRequest {
  serviceId: string;
  quantity: number;
  selectedOptions?: Array<{
    optionId: string;
    selectedChoices: string[];
  }>;
  duration?: number;
}

export interface PriceCalculationResponse {
  success: boolean;
  message: string;
  data: {
    servicePrice: number;
    optionsPrice: number;
    totalPrice: number;
    breakdown: Array<{
      itemName: string;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }>;
    options: Array<{
      optionId: string;
      optionName: string;
      choices: Array<{
        choiceId: string;
        choiceName: string;
        priceAdjustment: number;
        displayOrder: number;
      }>;
    }>;
  };
}

export interface SuitableEmployeesResponse {
  success: boolean;
  message: string;
  data: Array<{
    employeeId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    rating: number;
    completedTasks: number;
    skills: string[];
    profilePicture?: string;
    experience: string;
    workingZones: Array<{
      district: string;
      city: string;
    }>;
  }>;
}

export const bookingService = {
  // Get customer default address
  getCustomerDefaultAddress: async (customerId: string) => {
    const response = await apiClient.get(`/customer/bookings/${customerId}/default-address`);
    return response.data;
  },

  // Create a new booking
  createBooking: async (request: BookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/customer/bookings', request);
    return response.data;
  },

  // Get service options
  getServiceOptions: async (serviceId: string) => {
    const response = await apiClient.get(`/customer/services/${serviceId}/options`);
    return response.data;
  },

  // Calculate price for a service with options
  calculatePrice: async (request: PriceCalculationRequest): Promise<PriceCalculationResponse> => {
    const response = await apiClient.post<PriceCalculationResponse>('/customer/services/calculate-price', request);
    return response.data;
  },

  // Get suitable employees for a service
  getSuitableEmployees: async (params: {
    serviceId: string;
    serviceDate: string;
    serviceTime: string;
    district: string;
    city: string;
  }): Promise<SuitableEmployeesResponse> => {
    const queryParams = new URLSearchParams({
      serviceId: params.serviceId,
      serviceDate: params.serviceDate,
      serviceTime: params.serviceTime,
      district: params.district,
      city: params.city
    });
    
    const response = await apiClient.get<SuitableEmployeesResponse>(`/customer/services/suitable-employees?${queryParams}`);
    return response.data;
  },

  // Get user's bookings with optional filters
  getUserBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<UserBookingsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/customer/bookings${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<UserBookingsResponse>(url);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string, reason?: string): Promise<BookingResponse> => {
    const response = await apiClient.patch<BookingResponse>(`/customer/bookings/${bookingId}/cancel`, {
      reason
    });
    return response.data;
  },

  // Rate a completed booking
  rateBooking: async (bookingId: string, rating: number, review?: string): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(`/customer/bookings/${bookingId}/rate`, {
      rating,
      review
    });
    return response.data;
  }
};

export default bookingService;
