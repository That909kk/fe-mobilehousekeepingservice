import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class BookingErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BookingErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '8px',
          margin: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h2>🚧 Có lỗi xảy ra trong booking flow</h2>
          <p>Không thể hiển thị trang đặt dịch vụ. Vui lòng thử lại.</p>
          {this.state.error && (
            <details style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Chi tiết lỗi</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={this.retry}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '16px'
              }}
            >
              🔄 Thử lại
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← Quay về Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BookingErrorBoundary;
