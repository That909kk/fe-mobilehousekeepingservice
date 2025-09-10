import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #00bf63 0%, #00a455 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
          color: 'white'
        }}>
          ✓
        </div>

        {/* Title */}
        <h1 style={{
          color: '#333',
          margin: '0 0 16px 0',
          fontSize: '28px',
          fontWeight: '700'
        }}>
          Đặt dịch vụ thành công!
        </h1>

        {/* Subtitle */}
        <p style={{
          color: '#666',
          margin: '0 0 32px 0',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. 
          Đơn đặt dịch vụ đã được ghi nhận và đang được xử lý.
        </p>

        {/* Info Cards */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          margin: '0 0 32px 0',
          textAlign: 'left'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            color: '#333',
            fontSize: '18px'
          }}>
            📋 Tiếp theo sẽ diễn ra:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#555'
          }}>
            <li style={{ marginBottom: '8px' }}>
              Nhân viên sẽ liên hệ xác nhận trong 15 phút
            </li>
            <li style={{ marginBottom: '8px' }}>
              Bạn sẽ nhận được SMS/Email xác nhận
            </li>
            <li style={{ marginBottom: '8px' }}>
              Nhân viên đến đúng giờ đã hẹn
            </li>
            <li>
              Thanh toán sau khi hoàn thành dịch vụ
            </li>
          </ul>
        </div>

        {/* Hotline */}
        <div style={{
          background: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          padding: '16px',
          margin: '0 0 32px 0'
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontWeight: '600',
            color: '#0056b3'
          }}>
            📞 Cần hỗ trợ?
          </p>
          <p style={{
            margin: 0,
            color: '#333'
          }}>
            Hotline: <strong>1900 123 456</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          <button
            onClick={() => navigate('/bookings')}
            style={{
              background: 'linear-gradient(135deg, #00bf63 0%, #00a455 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,191,99,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📋 Xem lịch sử đặt dịch vụ
          </button>

          <button
            onClick={() => navigate('/booking')}
            style={{
              background: 'white',
              color: '#00bf63',
              border: '2px solid #00bf63',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00bf63';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#00bf63';
            }}
          >
            🔄 Đặt dịch vụ khác
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.background = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
