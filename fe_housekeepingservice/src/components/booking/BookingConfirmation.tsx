import React, { useState } from 'react';
import { bookingService } from '../../services/bookingService';
import type { SimpleBookingData } from './BookingFlow';

interface BookingConfirmationProps {
  bookingData: SimpleBookingData;
  onConfirm: () => void;
  onBack: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingData,
  onConfirm,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare booking request data
      const bookingRequest = {
        addressId: "adrs0001-0000-0000-0000-000000000001", // TODO: Get real address ID from user selection
        bookingTime: `${bookingData.dateTime?.date}T${bookingData.dateTime?.timeSlot || '08:00'}:00`,
        note: bookingData.specialRequests || '',
        promoCode: null,
        bookingDetails: [
          {
            serviceId: parseInt(bookingData.selectedService?.serviceId || '0'),
            quantity: bookingData.quantity || 1,
            expectedPrice: bookingData.selectedService?.price || 0,
            expectedPricePerUnit: bookingData.selectedService?.price || 0,
            selectedChoiceIds: [] // TODO: Add service options if available
          }
        ],
        assignments: [
          {
            serviceId: parseInt(bookingData.selectedService?.serviceId || '0'),
            employeeId: "e1000001-0000-0000-0000-000000000001" // TODO: Get from employee selection
          }
        ]
      };

      const response = await bookingService.createBooking(bookingRequest);
      
      if (response?.bookingId) {
        onConfirm();
      } else {
        setError(response?.message || 'Không thể tạo đơn đặt dịch vụ');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Có lỗi xảy ra khi đặt dịch vụ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} phút`;
    } else if (minutes === 0) {
      return `${hours} giờ`;
    } else {
      return `${hours} giờ ${minutes} phút`;
    }
  };

  return (
    <div className="booking-confirmation">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px', color: '#333' }}>
          Xác nhận đặt dịch vụ
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Vui lòng kiểm tra lại thông tin trước khi xác nhận
        </p>
      </div>

      {/* Service Information */}
      <div className="confirmation-section">
        <h3>🧹 Thông tin dịch vụ</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Dịch vụ:</span>
            <span className="value">{bookingData.selectedService?.serviceName}</span>
          </div>
          <div className="info-item">
            <span className="label">Số lượng:</span>
            <span className="value">{bookingData.quantity || 1}</span>
          </div>
          <div className="info-item">
            <span className="label">Thời gian thực hiện:</span>
            <span className="value">
              {bookingData.selectedService?.duration 
                ? formatDuration(bookingData.selectedService.duration)
                : 'Chưa xác định'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="confirmation-section">
        <h3>📍 Địa điểm</h3>
        <div className="location-info">
          <p>{bookingData.location?.address}</p>
          <p>{bookingData.location?.district}, {bookingData.location?.city}</p>
        </div>
      </div>

      {/* DateTime Information */}
      <div className="confirmation-section">
        <h3>📅 Thời gian</h3>
        <div className="datetime-info">
          <p>
            {bookingData.dateTime?.date && bookingData.dateTime?.timeSlot 
              ? formatDateTime(bookingData.dateTime.date, bookingData.dateTime.timeSlot)
              : 'Chưa xác định'
            }
          </p>
        </div>
      </div>

      {/* Employee Information */}
      <div className="confirmation-section">
        <h3>👨‍💼 Nhân viên</h3>
        <div className="employee-info">
          <p>Hệ thống sẽ tự động chọn nhân viên phù hợp</p>
        </div>
      </div>

      {/* Price Information */}
      <div className="confirmation-section price-summary">
        <h3>💰 Tổng chi phí</h3>
        <div className="price-details">
          <div className="price-item">
            <span>{bookingData.selectedService?.serviceName}</span>
            <span>{formatPrice(bookingData.selectedService?.price || 0)}</span>
          </div>
          <div className="total-price">
            <span>Tổng cộng:</span>
            <span className="total-amount">
              {formatPrice(bookingData.selectedService?.price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="confirmation-section notes">
        <h3>ℹ️ Lưu ý quan trọng</h3>
        <ul>
          <li>Vui lòng có mặt tại địa điểm đã đăng ký</li>
          <li>Nhân viên sẽ liên hệ trước 15-30 phút</li>
          <li>Thanh toán sau khi hoàn thành dịch vụ</li>
          <li>Có thể hủy đặt dịch vụ trước 2 giờ</li>
          <li>Đánh giá dịch vụ sau khi hoàn thành</li>
        </ul>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="contact-info">
        <p>
          <strong>Hotline hỗ trợ: </strong>
          <a href="tel:1900123456">1900 123 456</a>
        </p>
        <p>
          <strong>Email: </strong>
          <a href="mailto:support@housekeeping.com">support@housekeeping.com</a>
        </p>
      </div>

      {/* Navigation */}
      <div className="booking-navigation">
        <button 
          type="button" 
          className="nav-button secondary" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Quay lại
        </button>
        <button 
          type="button" 
          className="nav-button primary confirm-button" 
          onClick={submitBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt dịch vụ'}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
