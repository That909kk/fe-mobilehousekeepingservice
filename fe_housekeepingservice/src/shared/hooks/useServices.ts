import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '../../services';
import type { ServiceResponse, ServiceSearchParams, SingleServiceResponse } from '../../types/service';

export const useServices = (params?: ServiceSearchParams) => {
  const [data, setData] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (searchParams?: ServiceSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await serviceService.getAllServices(searchParams || params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu dịch vụ');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const refetch = (newParams?: ServiceSearchParams) => {
    fetchServices(newParams);
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useServiceDetail = (serviceId: string | null) => {
  const [data, setData] = useState<SingleServiceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await serviceService.getServiceById(id);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải chi tiết dịch vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetail(serviceId);
    }
  }, [serviceId, fetchServiceDetail]);

  const refetch = () => {
    if (serviceId) {
      fetchServiceDetail(serviceId);
    }
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
