# Authentication API Documentation

This documentation outlines the authentication endpoints and their usage for the company management system.

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

## Authentication Endpoints

### 1. Register Super Admin
**Endpoint:** `POST /api/v1/auth/register-super-admin`

Creates a new super admin account with elevated privileges.

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "phoneNo": "1234567890",
  "password": "securepassword",
  "supreAdmincreatePassword": "special-admin-password"
}
```

**Response (201):**
```json
{
  "message": "SuperAdmin registered successfully"
}
```

### 2. Register Company
**Endpoint:** `POST /api/v1/auth/register/company`

Registers a new company and creates a company admin account.

**Request Body:**
```json
{
  "ownerName": "Owner Name",
  "companyName": "Company Name",
  "ownerEmail": "owner@company.com",
  "companyEmail": "info@company.com",
  "ownerPhoneNo": "1234567890",
  "companyPhoneNo": "0987654321",
  "password": "securepassword",
  "industry": "Technology",
  "address": {
    "country": "Country",
    "state": "State",
    "city": "City",
    "pincode": "123456"
  }
}
```
**Required:** Image file must be included in form-data

**Response (201):**
```json
{
  "message": "Company registered successfully"
}
```

### 3. Register Employee
**Endpoint:** `POST /api/v1/auth/register-employee`

Registers a new employee under a company.

**Request Body:**
```json
{
  "name": "Employee Name",
  "email": "employee@company.com",
  "phoneNo": "1234567890",
  "password": "securepassword",
  "companyId": "company_id",
  "designation": "Software Developer",
  "address": {
    "country": "Country",
    "state": "State",
    "city": "City",
    "pincode": "123456"
  }
}
```
**Required:** Image file must be included in form-data

**Response (201):**
```json
{
  "message": "Employee registered successfully, wait for you verification",
  "token": "jwt_token"
}
```

### 4. Login
**Endpoint:** `POST /api/v1/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token"
}
```

### 5. Logout
**Endpoint:** `POST /api/v1/auth/logout`

Logs out the user and invalidates the JWT token.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### 6. Get Profile
**Endpoint:** `GET /api/v1/auth/profile`

Retrieves the user's profile based on their role.

**Response (200):**
```json
{
  "user": {
    // Different response structure based on user role:
    // SuperAdmin: User details
    // CompanyAdmin: Company details with owner information
    // Employee: Employee details with user and company information
  }
}
```

### 7. Forgot Password
**Endpoint:** `POST /api/v1/auth/forgot-password`

Initiates the password reset process.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to email"
}
```

### 8. Check Reset Token
**Endpoint:** `POST /api/v1/auth/check-token`

Verifies if a password reset token is valid.

**Request Body:**
```json
{
  "token": "reset_token"
}
```

**Response (200):**
```json
{
  "message": "Forgot Password token is active now"
}
```

### 9. Reset Password
**Endpoint:** `put /api/v1/auth/reset-password`

Resets the user's password using a valid reset token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "new_secure_password"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

## Data Models

### User Roles
- `SuperAdmin`: System administrator with full access
- `CompanyAdmin`: Company owner/administrator
- `Employee`: Regular company employee

### Verification Status
- `Pending`: Initial state
- `Verify`: Approved
- `Rejected`: Access denied

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Bad Request - Invalid input or validation error
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `500`: Server Error - Internal server error

Common error response format:
```json
{
  "message": "Error description",
  "error": {} // Optional detailed error information
}
```

## Authentication Flow

1. The system uses JWT (JSON Web Tokens) for authentication
2. Tokens are stored in HTTP-only cookies
3. Token expiration is set to 7 days
4. Password reset tokens expire after 15 minutes
5. Company and employee verification is required for access

## Security Features

1. Password hashing using bcrypt
2. JWT token-based authentication
3. HTTP-only cookie storage
4. Secure password reset flow
5. Status checking for company and employee access
6. Image upload security with Cloudinary
7. Input validation and sanitization