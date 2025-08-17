# Frontend Housekeeping Service - API Integration Updates

## Overview

This document outlines the updates made to the frontend application to align with the API specifications defined in the api-templates.

## Key Changes Made

### 1. Type Definitions (src/types/auth.ts)

#### Updated Interfaces:
- **LoginRequest**: Added `role` and `deviceType` fields
- **RegisterRequest**: Updated field names (`fullName`, `phoneNumber` instead of `full_name`, `phone_number`)
- **LoginResponse**: Completely restructured to match API response format
- **RegisterResponse**: Added proper response structure

#### New Types:
- `UserRole`: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN'
- `DeviceType`: 'WEB' | 'MOBILE'
- `UserStatus`: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
- `CustomerData`, `EmployeeData`, `AdminData`: Role-specific user data
- `ChangePasswordRequest`: For password change functionality
- `ApiResponse<T>`: Generic API response wrapper

### 2. Auth Service (src/services/authService.ts)

#### Updated Base URL:
- Changed from `localhost:3000` to `localhost:8080` to match API server

#### Enhanced Token Management:
- Updated localStorage keys (`accessToken`, `refreshToken` instead of `access_token`, `refresh_token`)
- Added automatic token storage in login response
- Improved error handling with automatic logout on 401 errors

#### New Methods:
- `changePassword()`: Handle password changes
- `getActiveSessions()`: Retrieve active sessions
- `validateToken()`: Validate current token
- Utility methods: `getCurrentUser()`, `getCurrentUserRole()`, etc.

### 3. Components Updates

#### Login Component (src/components/auth/Login.tsx)
- Added role selection dropdown
- Updated form state to include `role` and `deviceType`
- Enhanced form validation
- Updated API call to use new request/response format

#### Register Component (src/components/auth/Register.tsx)
- Reordered fields (role first, then fullName, username, etc.)
- Updated field names to match API expectations
- Enhanced validation with proper business rules:
  - Username: 3-50 characters, alphanumeric + underscore only
  - Full Name: letters and spaces only, max 100 characters
  - Email: max 255 characters
  - Phone: support for international formats
  - Password: 6-100 characters

#### New ChangePassword Component
- Complete password change functionality
- Three-step validation (current, new, confirm)
- Automatic logout and redirect after successful change
- Proper error handling

### 4. Static Data Updates

#### Login (src/static-data/pages/login.json)
- Added role selection labels and options
- Updated validation messages

#### Register (src/static-data/pages/register.json)
- Updated field names to match new component structure
- Enhanced validation messages with specific business rules
- Added role selection options

#### New Change Password (src/static-data/pages/change-password.json)
- Complete internationalization for password change feature

### 5. New Utility Hooks and Components

#### useAuth Hook (src/shared/hooks/useAuth.ts)
- Comprehensive authentication state management
- Auto token validation and refresh
- Role-based access control helpers
- Persistent authentication state

#### ProtectedRoute Component (src/shared/components/ProtectedRoute.tsx)
- Route protection based on authentication status
- Role-based route access control
- Loading states and proper redirects

## API Endpoints Integration

The frontend now properly integrates with these API endpoints:

### Authentication Endpoints:
- `POST /api/v1/auth/login` - User login with role-based authentication
- `POST /api/v1/auth/register` - User registration with enhanced validation
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Token refresh
- `POST /api/v1/auth/change-password` - Password change
- `GET /api/v1/auth/sessions` - Get active sessions
- `GET /api/v1/auth/validate-token` - Token validation

### Request/Response Formats:
All API calls now use the standardized format:
```typescript
{
  success: boolean;
  message: string;
  data?: any;
}
```

## Role-Based Features

### Supported Roles:
1. **CUSTOMER**: End users who book housekeeping services
2. **EMPLOYEE**: Staff members who provide services
3. **ADMIN**: System administrators

### Role-Specific Data:
- Each role has specific data structure in the user profile
- Different fields and permissions based on role
- Role-based navigation and feature access

## Security Enhancements

### Token Management:
- Secure token storage in localStorage
- Automatic token refresh on expiration
- Proper cleanup on logout

### Validation:
- Enhanced client-side validation matching API requirements
- Business rule enforcement (username format, password strength, etc.)
- Role-based access control

## Usage Examples

### Login with Role:
```typescript
const loginData = {
  username: "john_doe",
  password: "123456",
  role: "CUSTOMER",
  deviceType: "WEB"
};
```

### Register with Enhanced Validation:
```typescript
const registerData = {
  username: "new_user",
  password: "securePassword123",
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "+84123456789",
  role: "CUSTOMER"
};
```

### Protected Routes:
```typescript
<ProtectedRoute requiredRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredRoles={["EMPLOYEE", "ADMIN"]}>
  <ManagementPanel />
</ProtectedRoute>
```

## Migration Notes

### Breaking Changes:
1. Updated localStorage keys for tokens
2. Changed API response structure handling
3. Updated form field names in Register component
4. Added mandatory role selection in login

### Recommended Actions:
1. Clear browser localStorage before testing
2. Update any existing API mocks to match new format
3. Test all authentication flows with different roles
4. Verify token refresh functionality

## Development Guidelines

### Adding New Features:
1. Follow the established type definitions
2. Use the `useAuth` hook for authentication state
3. Implement proper error handling with user-friendly messages
4. Add internationalization support via static data files

### Testing:
1. Test with all three user roles
2. Verify token refresh scenarios
3. Test offline/online transitions
4. Validate form submissions with various input combinations
