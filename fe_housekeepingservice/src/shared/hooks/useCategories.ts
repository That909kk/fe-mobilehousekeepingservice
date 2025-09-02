import { useState, useEffect } from 'react';
import { categoryService } from '../../services';
import type { CategoryResponse, ServiceCategory } from '../../types/service';

export const useCategories = () => {
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoryService.getAllCategories();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh mục dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useCategoryDetail = (categoryId: string | null) => {
  const [data, setData] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoryService.getCategoryById(id);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải chi tiết danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetail(categoryId);
    }
  }, [categoryId]);

  const refetch = () => {
    if (categoryId) {
      fetchCategoryDetail(categoryId);
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
