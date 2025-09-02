// Employee Schedule related types
export interface EmployeeSchedule {
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  status: 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED';
  serviceId?: string;
  serviceName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSearchParams {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  shiftType?: string;
  page?: number;
  limit?: number;
}

export interface CreateScheduleRequest {
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  serviceId?: string;
  customerId?: string;
  notes?: string;
}

export interface UpdateScheduleRequest {
  workDate?: string;
  startTime?: string;
  endTime?: string;
  shiftType?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  status?: 'SCHEDULED' | 'WORKING' | 'COMPLETED' | 'CANCELLED';
  serviceId?: string;
  customerId?: string;
  notes?: string;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  data: EmployeeSchedule[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleScheduleResponse {
  success: boolean;
  message: string;
  data: EmployeeSchedule;
}

export interface EmployeeAvailability {
  employeeId: string;
  employeeName: string;
  availableSlots: {
    date: string;
    timeSlots: {
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
  }[];
}
