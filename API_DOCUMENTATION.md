# NyayaSetu API Documentation

## Overview

The NyayaSetu API provides endpoints for managing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.

## Base URL

- Development: `http://localhost:8000/api/v1`
- Production: `https://api.nyayasetu.gov.in/api/v1`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- `PUBLIC`: General citizens applying for benefits
- `DISTRICT_AUTHORITY`: Local government officials
- `SOCIAL_WELFARE`: State-level welfare officers
- `FINANCIAL_INSTITUTION`: Banking partners
- `ADMIN`: System administrators

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "aadhaar_number": "123456789012",
  "date_of_birth": "1990-01-01",
  "gender": "MALE",
  "category": "SC",
  "address": "123 Main Street",
  "district": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "role": "PUBLIC",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "phone_number": "+919876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "requires_otp": true
}
```

#### Verify OTP
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

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "PUBLIC"
  }
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "phone_number": "+919876543210",
  "full_name": "John Doe",
  "role": "PUBLIC",
  "is_active": true,
  "is_verified": true
}
```

### Users

#### Get User Profile
```http
GET /users/me
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### Update User Profile
```http
PUT /users/me
```

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "address": "456 New Street",
  "district": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

#### Upload Profile Image
```http
POST /users/me/upload-profile-image
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload

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

