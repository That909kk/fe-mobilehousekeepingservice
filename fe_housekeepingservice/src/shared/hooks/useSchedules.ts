import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../../services';
import type { 
  ScheduleResponse, 
  ScheduleSearchParams,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../../types/schedule';

export const useSchedules = (params?: ScheduleSearchParams) => {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (searchParams?: ScheduleSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await scheduleService.getEmployeeSchedules(searchParams || params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const refetch = (newParams?: ScheduleSearchParams) => {
    fetchSchedules(newParams);
  };

  const createSchedule = async (data: CreateScheduleRequest) => {
    const response = await scheduleService.createSchedule(data);
    await fetchSchedules(); // Refresh data
    return response;
  };

  const updateSchedule = async (scheduleId: string, data: UpdateScheduleRequest) => {
    const response = await scheduleService.updateSchedule(scheduleId, data);
    await fetchSchedules(); // Refresh data
    return response;
  };

  const deleteSchedule = async (scheduleId: string) => {
    const response = await scheduleService.deleteSchedule(scheduleId);
    await fetchSchedules(); // Refresh data
    return response;
  };

  return {
    data,
    loading,
    error,
    refetch,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
};

export const useTodaySchedules = (employeeId?: string) => {
  const [data, setData] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await scheduleService.getTodaySchedules(employeeId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải lịch làm việc hôm nay');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTodaySchedules();
  }, [fetchTodaySchedules]);

  const refetch = () => {
    fetchTodaySchedules();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};
