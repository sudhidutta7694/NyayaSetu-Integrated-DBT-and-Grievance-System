# NyayaSetu API Documentation

[![API Version](https://img.shields.io/badge/API-v1-blue.svg)](https://github.com/yourusername/nyayasetu)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)

> Comprehensive API documentation for NyayaSetu - Integrated DBT and Grievance System

## 📑 Table of Contents

- [Overview](#overview)
- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Applications](#application-endpoints)
  - [Documents](#document-endpoints)
  - [District Authority](#district-authority-endpoints)
  - [Social Welfare](#social-welfare-endpoints)
  - [Financial Institutions](#financial-institution-endpoints)
  - [Onboarding](#onboarding-endpoints)
  - [Cases](#case-management-endpoints)
  - [Chatbot](#chatbot-endpoints)
  - [Admin](#admin-endpoints)
- [Webhooks](#webhooks)
- [SDKs](#sdks-and-libraries)
- [Testing](#testing)

## Overview

The NyayaSetu API provides a comprehensive set of RESTful endpoints for managing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of:
- **PCR Act, 1955** (Protection of Civil Rights Act)
- **PoA Act, 1989** (Prevention of Atrocities Act)

### Key Features

- 🔐 JWT-based authentication with 1-hour token expiration
- 🛡️ Role-based access control (RBAC)
- 📝 Comprehensive request/response validation
- 🔄 Real-time status tracking
- 📊 Pagination support for list endpoints
- 🌐 Multi-language error messages
- 📈 Audit logging for all critical operations

## Base URLs

| Environment | URL | Purpose |
|------------|-----|---------|
| **Development** | `http://localhost:8000/api/v1` | Local development |
| **Staging** | `https://staging-api.nyayasetu.gov.in/api/v1` | Pre-production testing |
| **Production** | `https://api.nyayasetu.gov.in/api/v1` | Live production API |

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## Authentication

The API uses **JWT (JSON Web Token)** for authentication. Tokens are issued upon successful login and must be included in subsequent requests.

### Token Structure

```json
{
  "sub": "user_id",
  "role": "PUBLIC",
  "exp": 1634567890,
  "iat": 1634564290
}
```

### Including Token in Requests

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Access Token**: Expires in **60 minutes**
- **Refresh Token**: Not implemented yet (coming soon)

### Authentication Flow

```
1. User → POST /auth/login (phone_number)
2. API → Sends OTP via SMS
3. User → POST /auth/verify-otp (phone_number + otp_code)
4. API → Returns JWT access_token
5. User → Include token in all subsequent requests
```

## User Roles

| Role | Value | Description | Access Level |
|------|-------|-------------|--------------|
| **Public** | `PUBLIC` | Citizens applying for benefits | Create/view own applications |
| **District Authority** | `DISTRICT_AUTHORITY` | Local government officials | Review applications, verify documents |
| **Social Welfare** | `SOCIAL_WELFARE` | State-level welfare officers | Final approval, fund allocation |
| **Financial Institution** | `FINANCIAL_INSTITUTION` | Banking partners | Process fund disbursement |
| **Admin** | `ADMIN` | System administrators | Full system access |

### Role Hierarchy

```
ADMIN
  ├── SOCIAL_WELFARE
  │     ├── DISTRICT_AUTHORITY
  │     │     └── PUBLIC
  └── FINANCIAL_INSTITUTION
```

## Rate Limiting

To ensure fair usage and system stability, the following rate limits apply:

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| **General API** | 60 requests | per minute |
| **Authentication** | 5 requests | per minute |
| **File Upload** | 10 requests | per minute |
| **Chatbot** | 30 requests | per minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634567890
```

### Rate Limit Exceeded Response

```json
{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

## Error Handling

All error responses follow a consistent format:

### Error Response Structure

```json
{
  "error": "ErrorType",
  "message": "Human-readable error description",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/applications"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **204** | No Content | Request successful, no content to return |
| **400** | Bad Request | Invalid request data |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource conflict (e.g., duplicate entry) |
| **422** | Unprocessable Entity | Validation error |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side error |
| **503** | Service Unavailable | Service temporarily unavailable |

### Common Error Types

<details>
<summary><b>Validation Error (422)</b></summary>

```json
{
  "error": "ValidationError",
  "message": "Request validation failed",
  "details": {
    "email": [
      "Invalid email format"
    ],
    "phone_number": [
      "Phone number must be 10 digits"
    ]
  }
}
```

</details>

<details>
<summary><b>Authentication Error (401)</b></summary>

```json
{
  "error": "AuthenticationError",
  "message": "Invalid or expired token",
  "details": {
    "reason": "Token has expired"
  }
}
```

</details>

<details>
<summary><b>Authorization Error (403)</b></summary>

```json
{
  "error": "AuthorizationError",
  "message": "Insufficient permissions",
  "details": {
    "required_role": "DISTRICT_AUTHORITY",
    "user_role": "PUBLIC"
  }
}
```

</details>

<details>
<summary><b>Resource Not Found (404)</b></summary>

```json
{
  "error": "NotFoundError",
  "message": "Application not found",
  "details": {
    "resource_type": "Application",
    "resource_id": "app_123"
  }
}
```

</details>

---

## Endpoints

## Authentication Endpoints

### Register User

Create a new public user account.

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "aadhaar_number": "123456789012",
  "date_of_birth": "1990-01-15",
  "gender": "MALE",
  "category": "SC",
  "address": "123 Main Street",
  "district": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response (201 Created):**

```json
{
  "id": "usr_abc123",
  "email": "john.doe@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "role": "PUBLIC",
  "is_active": true,
  "is_verified": false,
  "is_onboarded": false,
  "onboarding_step": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Validation Rules:**

- `email`: Valid email format
- `phone_number`: Valid Indian mobile number (+91 prefix)
- `aadhaar_number`: 12 digits
- `pincode`: 6 digits
- `category`: One of `SC`, `ST`, `OBC`, `GENERAL`
- `gender`: One of `MALE`, `FEMALE`, `OTHER`

---

### Login (Send OTP)

Initiate login by sending OTP to registered phone number.

```http
POST /auth/login
```

**Request Body:**

```json
{
  "phone_number": "+919876543210"
}
```

**Response (200 OK):**

```json
{
  "message": "OTP sent successfully",
  "requires_otp": true,
  "phone_number": "+91******3210",
  "expires_in": 300
}
```

**Error Responses:**

- `404`: User not found
- `403`: User account deactivated
- `429`: Too many OTP requests

---

### Verify OTP

Verify OTP and receive authentication token.

```http
POST /auth/verify-otp
```

**Request Body:**

```json
{
  "phone_number": "+919876543210",
  "otp_code": "123456"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_abc123",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "role": "PUBLIC",
    "is_onboarded": false,
    "onboarding_step": 0
  }
}
```

**Error Responses:**

- `401`: Invalid OTP
- `410`: OTP expired
- `429`: Too many verification attempts

---

### Get Current User

Retrieve authenticated user details.

```http
GET /auth/me
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "usr_abc123",
  "email": "john.doe@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "role": "PUBLIC",
  "is_active": true,
  "is_verified": true,
  "is_onboarded": true,
  "onboarding_step": 3,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

---

### Social Welfare Login

Password-based login for social welfare officers.

```http
POST /auth/social-welfare/login
```

**Request Body:**

```json
{
  "email": "welfare.officer@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### District Authority Login

Password-based login for district authority officers.

```http
POST /auth/district-authority/login
```

**Request Body:**

```json
{
  "email": "district.officer@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## User Endpoints

### Get User Profile

Retrieve full user profile with all details.

```http
GET /users/me
```

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "usr_abc123",
  "email": "john.doe@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "aadhaar_number": "************9012",
  "date_of_birth": "1990-01-15",
  "gender": "MALE",
  "category": "SC",
  "address": "123 Main Street",
  "district": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "profile_image_url": "https://storage.example.com/profiles/usr_abc123.jpg",
  "bank_details": {
    "account_number": "**********3456",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "branch": "Main Branch",
    "account_holder_name": "John Doe",
    "is_verified": true
  },
  "role": "PUBLIC",
  "is_active": true,
  "is_verified": true,
  "is_onboarded": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

---

### Update User Profile

Update user profile information.

```http
PUT /users/me
```

**Request Body:**

```json
{
  "full_name": "John Michael Doe",
  "address": "456 New Street, Apartment 5B",
  "district": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

**Response (200 OK):**

```json
{
  "id": "usr_abc123",
  "email": "john.doe@example.com",
  "full_name": "John Michael Doe",
  "address": "456 New Street, Apartment 5B",
  "district": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "updated_at": "2024-01-21T09:15:00Z"
}
```

**Note**: Aadhaar-verified fields (name, DOB, gender from UIDAI) cannot be modified.

---

### Upload Profile Image

Upload or update profile picture.

```http
POST /users/me/upload-profile-image
```

**Request:**

- Content-Type: `multipart/form-data`
- Max file size: 5MB
- Allowed formats: JPG, JPEG, PNG

**Form Data:**

```
file: [binary image data]
```

**Response (200 OK):**

```json
{
  "message": "Profile image uploaded successfully",
  "profile_image_url": "https://storage.example.com/profiles/usr_abc123.jpg"
}
```

---

### Add/Update Bank Account

Add or update bank account details.

```http
POST /users/me/bank-account
```

**Request Body:**

```json
{
  "account_number": "1234567890123456",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "branch": "Main Branch",
  "account_holder_name": "John Doe"
}
```

**Response (200 OK):**

```json
{
  "message": "Bank account details updated successfully",
  "bank_details": {
    "account_number": "**********3456",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "branch": "Main Branch",
    "account_holder_name": "John Doe",
    "is_verified": false
  }
}
```

---

### Applications

#### Create Application
```http
POST /applications
```

**Request Body:**
```json
{
  "title": "Relief for Caste-based Discrimination",
  "description": "Application for monetary relief under PCR Act",
  "amount_requested": 50000.00,
  "bank_account_number": "1234567890123456",
  "bank_ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "bank_branch": "Main Branch",
  "account_holder_name": "John Doe"
}
```

#### Get Applications
```http
GET /applications
```

**Query Parameters:**
- `status`: Filter by status
- `skip`: Number of records to skip
- `limit`: Number of records to return

#### Get Application by ID
```http
GET /applications/{application_id}
```

#### Update Application
```http
PUT /applications/{application_id}
```

#### Submit Application
```http
POST /applications/{application_id}/submit
```

### Documents

#### Upload Document
```http
POST /documents
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload with metadata

**Form Data:**
- `file`: Document file
- `document_type`: Type of document (CASTE_CERTIFICATE, BANK_PASSBOOK, etc.)
- `application_id`: Associated application ID

#### Get Documents
```http
GET /documents
```

#### Verify Document
```http
POST /documents/{document_id}/verify
```

**Request Body:**
```json
{
  "status": "VERIFIED",
  "notes": "Document verified successfully"
}
```

### Cases

#### Register Case
```http
POST /cases
```

**Request Body:**
```json
{
  "title": "Caste-based Discrimination Case",
  "description": "Case registered for caste-based discrimination incident",
  "fir_number": "FIR/2024/001",
  "police_station": "Main Police Station",
  "district": "Mumbai",
  "state": "Maharashtra"
}
```

#### Get Cases
```http
GET /cases
```

#### Update Case Status
```http
PUT /cases/{case_id}
```

## District Authority Endpoints

### Get Pending Applications
```http
GET /district-authority/applications/pending
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "applications": [
    {
      "id": "app_id",
      "application_number": "APP-2024-001",
      "user_id": "user_id",
      "title": "PCR Act Compensation",
      "description": "Application for compensation under PCR Act",
      "application_type": "COMPENSATION",
      "status": "UNDER_REVIEW",
      "amount_requested": 50000.00,
      "fir_number": "FIR/2024/001",
      "cctns_verified": false,
      "submitted_at": "2024-01-10T10:00:00Z",
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Get Application Details
```http
GET /district-authority/applications/{application_id}
```

**Response:**
```json
{
  "application": {
    "id": "app_id",
    "application_number": "APP-2024-001",
    "title": "PCR Act Compensation",
    "description": "Compensation for caste-based discrimination",
    "application_type": "COMPENSATION",
    "status": "UNDER_REVIEW",
    "amount_requested": 50000.00,
    "fir_number": "FIR/2024/001",
    "cctns_verified": false,
    "district_comments": null,
    "district_reviewed_by": null,
    "district_reviewed_at": null,
    "bank_account_number": "1234567890",
    "bank_ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "submitted_at": "2024-01-10T10:00:00Z"
  },
  "applicant": {
    "id": "user_id",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+919876543210",
    "aadhaar_number": "123456789012",
    "address": "123 Main Street",
    "district": "Mumbai",
    "state": "Maharashtra"
  },
  "documents": [
    {
      "id": "doc_id",
      "document_type": "CASTE_CERTIFICATE",
      "document_name": "Caste Certificate.pdf",
      "status": "PENDING",
      "verification_notes": null,
      "is_digilocker": false,
      "created_at": "2024-01-10T09:30:00Z"
    }
  ]
}
```

### CCTNS FIR Verification
```http
POST /district-authority/applications/{application_id}/cctns-verify
```

**Request Body:**
```json
{
  "fir_number": "FIR/2024/001"
}
```

**Response:**
```json
{
  "message": "CCTNS verification completed",
  "verification_result": {
    "verified": true,
    "message": "FIR verified successfully through CCTNS",
    "verification_date": "2024-01-10T15:30:00Z"
  },
  "application_status": "UNDER_REVIEW",
  "cctns_verified": true
}
```

### Document Verification
```http
POST /district-authority/documents/{document_id}/verify
```

**Request Body:**
```json
{
  "status": "VERIFIED",
  "comments": "Document verified and approved"
}
```

**Possible status values:**
- `VERIFIED`: Document is approved
- `REJECTED`: Document is rejected
- `PENDING`: Document sent back with comments

**Response:**
```json
{
  "message": "Document approved successfully",
  "document": {
    "id": "doc_id",
    "status": "VERIFIED",
    "verification_notes": "Document verified and approved",
    "verified_by": "district_officer_id",
    "verified_at": "2024-01-10T16:00:00Z"
  }
}
```

### Application Review
```http
POST /district-authority/applications/{application_id}/review
```

**Request Body:**
```json
{
  "action": "approve",
  "comments": "All documents verified and CCTNS confirmed. Forwarding to Social Welfare."
}
```

**Possible action values:**
- `approve`: Approve application and forward to Social Welfare
- `reject`: Reject the application
- `pending`: Send back to user for additional information

**Response:**
```json
{
  "message": "Application approved and forwarded to Social Welfare department",
  "application": {
    "id": "app_id",
    "status": "APPROVED",
    "district_comments": "All documents verified and CCTNS confirmed.",
    "district_reviewed_by": "district_officer_id",
    "district_reviewed_at": "2024-01-10T16:30:00Z",
    "approved_at": "2024-01-10T16:30:00Z"
  }
}
```

### Dashboard Statistics
```http
GET /district-authority/dashboard/stats
```

**Response:**
```json
{
  "pending_applications": 25,
  "approved_applications": 150,
  "rejected_applications": 8,
  "pending_documents": 45,
  "verified_documents": 320,
  "total_applications": 183
}
```

## Enhanced Case Management Endpoints

### Get District Cases
```http
GET /cases/district/cases
```

**Query Parameters:**
- `status` (optional): Filter by application status
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

### Verify Document (Cases API)
```http
POST /cases/pending/{case_id}/documents/{document_id}/verify
```

**Request Body:**
```json
{
  "status": "VERIFIED",
  "comments": "Document looks authentic and complete"
}
```

### Enhanced Case Action
```http
POST /cases/pending/{case_id}/action
```

**Request Body:**
```json
{
  "action": "approve",
  "comments": "All verifications completed successfully"
}
```

### Notifications

#### Get Notifications
```http
GET /notifications
```

#### Mark Notification as Read
```http
PUT /notifications/{notification_id}/read
```

### Chatbot

#### Send Message
```http
POST /chatbot/message
```

**Request Body:**
```json
{
  "message": "How do I apply for relief?",
  "session_id": "session_id"
}
```

#### Speech to Text
```http
POST /chatbot/speech-to-text
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: Audio file

### Admin

#### Get Dashboard Statistics
```http
GET /admin/dashboard
```

#### Get Users
```http
GET /admin/users
```

#### Get Audit Logs
```http
GET /admin/audit-logs
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Error description",
  "details": {}
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

- General API: 60 requests per minute
- Authentication endpoints: 5 requests per minute
- File uploads: 10 requests per minute

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: PDF, JPG, JPEG, PNG, DOC, DOCX
- Maximum files per application: 10

## Webhooks

The API supports webhooks for real-time notifications:

- Application status changes
- Document verification updates
- Case status updates
- Payment disbursements

## SDKs and Libraries

### Python
```python
import requests

# Set base URL and token
BASE_URL = "http://localhost:8000/api/v1"
TOKEN = "your-jwt-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Example: Get current user
response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
user_data = response.json()
```

### JavaScript
```javascript
const API_BASE_URL = 'http://localhost:8000/api/v1';
const token = 'your-jwt-token';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Example: Get current user
fetch(`${API_BASE_URL}/auth/me`, { headers })
  .then(response => response.json())
  .then(data => console.log(data));
```

## Testing

### Postman Collection

Import the Postman collection from `/docs/postman/nyayasetu-api.json` for easy testing.

### cURL Examples

#### Register User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone_number": "+919876543210",
    "full_name": "Test User"
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210"
  }'
```

## Support

For API support and questions:
- Email: api-support@nyayasetu.gov.in
- Documentation: https://docs.nyayasetu.gov.in
- Status Page: https://status.nyayasetu.gov.in

