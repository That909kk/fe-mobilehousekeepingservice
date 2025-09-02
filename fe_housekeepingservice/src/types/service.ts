// Service related types
export interface Service {
  serviceId: string;
  serviceName: string;
  description: string;
  price: number;
  unit: 'hour' | 'm2' | 'package';
  duration: number;
  categoryId: string;
  categoryName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  categoryId: string;
  categoryName: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSearchParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: ServiceCategory[];
}

export interface SingleServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: ServiceCategory;
}
