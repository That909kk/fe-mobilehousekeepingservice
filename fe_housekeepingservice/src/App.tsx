import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyOTP from './components/auth/VerifyOTP';
import ResetPassword from './components/auth/ResetPassword';
import RoleSelector from './components/auth/RoleSelector';
import Dashboard from './components/Dashboard';
import Services from './components/Services';
import BookingFlow from './components/booking/BookingFlow';
import BookingErrorBoundary from './components/booking/BookingErrorBoundary';
import BookingSuccess from './components/booking/BookingSuccess';
import BookingHistory from './components/booking/BookingHistory';
import PermissionManagement from './components/admin/PermissionManagement';
import DebugUserInfo from './components/DebugUserInfo';
import ProtectedRoute from './shared/components/ProtectedRoute';
import { useAuth } from './shared/hooks/useAuth';
import './App.css';

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              <PublicRoute>
                <VerifyOTP />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/role-selector" 
            element={<RoleSelector />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Permission Management Route */}
          <Route 
            path="/admin/permissions" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Admin',
                  action: 'MANAGE', 
                  resource: 'admin.permission.manage'
                }}
              >
                <PermissionManagement />
              </ProtectedRoute>
            } 
          />

          {/* Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Admin',
                  action: 'VIEW', 
                  resource: 'admin.dashboard.view'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin User Management Route */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Admin',
                  action: 'MANAGE', 
                  resource: 'admin.user.manage'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Booking Routes */}
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute 
                requiredRoles={['CUSTOMER']}
              >
                <BookingErrorBoundary>
                  <BookingFlow />
                </BookingErrorBoundary>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/success" 
            element={
              <ProtectedRoute 
                requiredRoles={['CUSTOMER']}
              >
                <BookingSuccess />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/booking/create" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Booking',
                  action: 'CREATE', 
                  resource: 'booking.create'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/history" 
            element={
              <ProtectedRoute 
                requiredRoles={['CUSTOMER']}
              >
                <BookingHistory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/available" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Booking',
                  action: 'VIEW', 
                  resource: 'booking.view.available'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/assigned" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Booking',
                  action: 'VIEW', 
                  resource: 'booking.view.assigned'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/accept" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Booking',
                  action: 'ACCEPT', 
                  resource: 'booking.accept'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/booking/cancel" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Booking',
                  action: 'CANCEL', 
                  resource: 'booking.cancel'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Profile Routes */}
          <Route 
            path="/profile/customer" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Account',
                  action: 'EDIT', 
                  resource: 'profile.customer.edit'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile/employee" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Account',
                  action: 'EDIT', 
                  resource: 'profile.employee.edit'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Review Route */}
          <Route 
            path="/reviews" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Review',
                  action: 'CREATE', 
                  resource: 'review.create'
                }}
              >
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Services Route with updated permission check */}
          <Route 
            path="/services" 
            element={
              <ProtectedRoute 
                requiredPermission={{
                  module: 'Service',
                  action: 'VIEW', 
                  resource: 'service.view'
                }}
              >
                <Services />
              </ProtectedRoute>
            } 
          />

          {/* Debug Route */}
          <Route 
            path="/debug" 
            element={
              <ProtectedRoute>
                <DebugUserInfo />
              </ProtectedRoute>
            } 
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
