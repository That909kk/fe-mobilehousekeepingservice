# API-Templates-Authentication.md

## Overview
Authentication APIs manage **user registration, login, token handling, and logout**.  
They integrate with the **`accounts`** table and support **role-based access control**.
---
## Base URL
```
/api/v1/auth
```
---
## 1. Register
**POST** `/register`  
Create a new account.
### Request
```json
{
  "username": "john_doe",
  "password": "P@ssw0rd!",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+84123456789",
  "roles": "customer"
}
```

### Response (201 Created)
```json
{
  "message": "Account created successfully",
  "account": {
    "account_id": 1,
    "username": "john_doe",
    "roles": "customer",
    "status": "active",
    "created_at": "2025-08-13T10:15:30Z"
  }
}
```

### Response (400 Bad Request)
```json
{ "error": "Username already exists" }
```

---

## 2. Login
**POST** `/login`  
Authenticate and receive tokens.

### Request
```json
{
  "username": "john_doe",
  "password": "P@ssw0rd!"
}
```

### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg==",
  "expires_in": 3600,
  "roles": "customer"
}
```

### Response (401 Unauthorized)
```json
{ "error": "Invalid username or password" }
```

---

## 3. Refresh Token
**POST** `/refresh`  
Get a new access token using the refresh token.

### Request
```json
{ "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg==" }
```

### Response (200 OK)
```json
{
  "access_token": "newAccessTokenHere",
  "expires_in": 3600
}
```

### Response (403 Forbidden)
```json
{ "error": "Invalid or expired refresh token" }
```

---

## 4. Logout
**POST** `/logout`  
Invalidate refresh token.

### Request
```json
{ "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg==" }
```

### Response (200 OK)
```json
{ "message": "Successfully logged out" }
```

---

## 5. Get Current User
**GET** `/me`  
Return current user's profile.

### Headers
```
Authorization: Bearer <access_token>
```

### Response (200 OK)
```json
{
  "account_id": 1,
  "username": "john_doe",
  "roles": "customer",
  "status": "active",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+84123456789"
}
```

### Response (401 Unauthorized)
```json
{ "error": "Token is missing or invalid" }
```