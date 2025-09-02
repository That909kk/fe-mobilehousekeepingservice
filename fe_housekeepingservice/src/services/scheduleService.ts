import { apiClient } from './httpClient';
import type { 
  ScheduleResponse, 
  SingleScheduleResponse, 
  ScheduleSearchParams,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  EmployeeAvailability
} from '../types/schedule';

export const scheduleService = {
  // GET /api/v1/employee/schedules - Lấy danh sách lịch làm việc của nhân viên
  getEmployeeSchedules: async (params?: ScheduleSearchParams): Promise<ScheduleResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.shiftType) queryParams.append('shiftType', params.shiftType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `/employee/schedules${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ScheduleResponse>(url);
    return response.data;
  },

  // GET /api/v1/employee/schedules/{scheduleId} - Lấy chi tiết lịch làm việc theo ID
  getScheduleById: async (scheduleId: string): Promise<SingleScheduleResponse> => {
    const response = await apiClient.get<SingleScheduleResponse>(`/employee/schedules/${scheduleId}`);
    return response.data;
  },

  // POST /api/v1/employee/schedules - Tạo lịch làm việc mới
  createSchedule: async (data: CreateScheduleRequest): Promise<SingleScheduleResponse> => {
    const response = await apiClient.post<SingleScheduleResponse>('/employee/schedules', data);
    return response.data;
  },

  // PUT /api/v1/employee/schedules/{scheduleId} - Cập nhật lịch làm việc
  updateSchedule: async (scheduleId: string, data: UpdateScheduleRequest): Promise<SingleScheduleResponse> => {
    const response = await apiClient.put<SingleScheduleResponse>(`/employee/schedules/${scheduleId}`, data);
    return response.data;
  },

  // DELETE /api/v1/employee/schedules/{scheduleId} - Xóa lịch làm việc
  deleteSchedule: async (scheduleId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/employee/schedules/${scheduleId}`);
    return response.data;
  },

  // GET /api/v1/employee/schedules/available - Kiểm tra tình trạng có thể làm việc của nhân viên
  getEmployeeAvailability: async (params: {
    employeeId?: string;
    startDate: string;
    endDate: string;
  }): Promise<{ success: boolean; message: string; data: EmployeeAvailability[] }> => {
    const queryParams = new URLSearchParams();
    
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    
    const url = `/employee/schedules/available?${queryParams.toString()}`;
    const response = await apiClient.get<{ success: boolean; message: string; data: EmployeeAvailability[] }>(url);
    return response.data;
  },

  // GET /api/v1/employee/schedules/today - Lấy lịch làm việc hôm nay
  getTodaySchedules: async (employeeId?: string): Promise<ScheduleResponse> => {
    const queryParams = new URLSearchParams();
    if (employeeId) queryParams.append('employeeId', employeeId);
    
    const queryString = queryParams.toString();
    const url = `/employee/schedules/today${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ScheduleResponse>(url);
    return response.data;
  },

  // GET /api/v1/employee/schedules/week - Lấy lịch làm việc tuần này
  getWeekSchedules: async (employeeId?: string): Promise<ScheduleResponse> => {
    const queryParams = new URLSearchParams();
    if (employeeId) queryParams.append('employeeId', employeeId);
    
    const queryString = queryParams.toString();
    const url = `/employee/schedules/week${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ScheduleResponse>(url);
    return response.data;
  }
};
