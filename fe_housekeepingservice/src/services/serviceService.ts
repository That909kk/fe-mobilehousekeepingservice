import { apiClient } from './httpClient';
import type { 
  ServiceResponse, 
  SingleServiceResponse, 
  ServiceSearchParams 
} from '../types/service';

export const serviceService = {
  // GET /api/v1/customer/services - Lấy tất cả dịch vụ đang hoạt động
  getAllServices: async (params?: ServiceSearchParams): Promise<ServiceResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.unit) queryParams.append('unit', params.unit);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/customer/services${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ServiceResponse>(url);
    return response.data;
  },

  // GET /api/v1/customer/services/{serviceId} - Lấy chi tiết dịch vụ theo ID
  getServiceById: async (serviceId: string): Promise<SingleServiceResponse> => {
    const response = await apiClient.get<SingleServiceResponse>(`/customer/services/${serviceId}`);
    return response.data;
  },

  // GET /api/v1/customer/services/search - Tìm kiếm dịch vụ với các bộ lọc
  searchServices: async (params: ServiceSearchParams): Promise<ServiceResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.unit) queryParams.append('unit', params.unit);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/customer/services/search?${queryString}`;
    
    const response = await apiClient.get<ServiceResponse>(url);
    return response.data;
  },

  // GET /api/v1/customer/services/categories/{categoryId} - Lấy dịch vụ theo danh mục
  getServicesByCategory: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/customer/services/categories/${categoryId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ServiceResponse>(url);
    return response.data;
  },

  // Wrapper cho getAllServices để tương thích
  getServices: async (params?: ServiceSearchParams): Promise<ServiceResponse> => {
    return serviceService.getAllServices(params);
  },

  // GET /api/v1/customer/services/{serviceId}/options - Lấy tùy chọn của dịch vụ
  getServiceOptions: async (serviceId: string) => {
    const response = await apiClient.get(`/customer/services/${serviceId}/options`);
    return response.data;
  }
};
