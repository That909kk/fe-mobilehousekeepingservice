import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';

interface BookingHistoryItem {
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
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };
      
      const response = await bookingService.getUserBookings(params);
      if (response.success) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Không thể tải lịch sử đặt dịch vụ');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, selectedStatus]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt dịch vụ này?')) {
      try {
        await bookingService.cancelBooking(bookingId, 'Hủy bởi khách hàng');
        fetchBookings(); // Refresh the list
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Có lỗi xảy ra khi hủy đặt dịch vụ');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử đặt dịch vụ</h1>
          <p className="mt-2 text-gray-600">Quản lý và theo dõi các dịch vụ bạn đã đặt</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
              Lọc theo trạng thái:
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Chưa có lịch sử đặt dịch vụ
              </h3>
              <p className="text-gray-600">
                Bạn chưa đặt dịch vụ nào. Hãy bắt đầu đặt dịch vụ đầu tiên của bạn!
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.bookingId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.serviceName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Mã đặt dịch vụ:</strong> {booking.bookingId}</p>
                          <p><strong>Ngày dịch vụ:</strong> {formatDate(booking.serviceDate)}</p>
                          <p><strong>Thời gian:</strong> {booking.serviceTime}</p>
                          <p><strong>Số lượng:</strong> {booking.quantity}</p>
                        </div>
                        <div>
                          <p><strong>Địa chỉ:</strong> {booking.address}</p>
                          <p><strong>Quận/Huyện:</strong> {booking.district}</p>
                          <p><strong>Thành phố:</strong> {booking.city}</p>
                          {booking.employeeName && (
                            <p><strong>Nhân viên:</strong> {booking.employeeName}</p>
                          )}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <strong>Ghi chú:</strong> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(booking.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Đặt lúc: {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-3">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Hủy đặt dịch vụ
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          Đánh giá dịch vụ
                        </button>
                      )}
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {bookings.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md">
                Trang {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={bookings.length < limit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
