import { apiClient } from './httpClient';
import type { 
  CategoryResponse, 
  SingleCategoryResponse 
} from '../types/service';

export const categoryService = {
  // GET /api/v1/customer/categories - Lấy tất cả danh mục đang hoạt động
  getAllCategories: async (): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>('/customer/categories');
    return response.data;
  },

  // GET /api/v1/customer/categories/{categoryId} - Lấy chi tiết danh mục theo ID
  getCategoryById: async (categoryId: string): Promise<SingleCategoryResponse> => {
    const response = await apiClient.get<SingleCategoryResponse>(`/customer/categories/${categoryId}`);
    return response.data;
  },

  // GET /api/v1/customer/categories/{categoryId}/services - Lấy danh sách dịch vụ theo danh mục
  getServicesByCategoryId: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/customer/categories/${categoryId}/services${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }
};
