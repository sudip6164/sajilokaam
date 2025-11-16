# Sajilo Kaam - API Documentation

Complete API reference for the Sajilo Kaam freelance management platform.

## Base URL
- Development: `http://localhost:8080/api`
- Production: `https://api.sajilokaam.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "roles": ["FREELANCER"]
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "bio": "Experienced developer"
}
```

---

## Jobs Endpoints

### List All Jobs
```http
GET /api/jobs?status=OPEN&category=WEB_DEVELOPMENT&page=0&size=20
```

**Query Parameters:**
- `status`: OPEN, CLOSED, IN_PROGRESS
- `category`: Job category ID
- `skill`: Skill ID
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)

### Get Job Details
```http
GET /api/jobs/{id}
```

### Create Job (Client Only)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Website Development",
  "description": "Need a modern website",
  "budget": 50000,
  "deadline": "2024-12-31",
  "categoryId": 1,
  "skillIds": [1, 2]
}
```

### Update Job
```http
PUT /api/jobs/{id}
Authorization: Bearer <token>
```

### Delete Job
```http
DELETE /api/jobs/{id}
Authorization: Bearer <token>
```

### Get My Jobs (Client)
```http
GET /api/jobs/my-jobs
Authorization: Bearer <token>
```

### Get Job Bids
```http
GET /api/jobs/{jobId}/bids
```

### Submit Bid
```http
POST /api/jobs/{jobId}/bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 45000,
  "proposal": "I can deliver this project in 2 weeks",
  "estimatedDays": 14
}
```

### Accept/Reject Bid
```http
POST /api/jobs/{jobId}/bids/{bidId}/accept
POST /api/jobs/{jobId}/bids/{bidId}/reject
Authorization: Bearer <token>
```

---

## Projects Endpoints

### List Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

### Get Project Details
```http
GET /api/projects/{id}
Authorization: Bearer <token>
```

### Update Project
```http
PUT /api/projects/{id}
Authorization: Bearer <token>
```

### Delete Project
```http
DELETE /api/projects/{id}
Authorization: Bearer <token>
```

---

## Tasks Endpoints

### Get Project Tasks
```http
GET /api/projects/{projectId}/tasks
Authorization: Bearer <token>
```

### Create Task
```http
POST /api/projects/{projectId}/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Implement login page",
  "description": "Create responsive login UI",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-12-15",
  "estimatedHours": 8,
  "assigneeId": 2
}
```

### Update Task Status
```http
PATCH /api/projects/{projectId}/tasks/{taskId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Assign Task
```http
PATCH /api/projects/{projectId}/tasks/{taskId}/assignee
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigneeId": 2
}
```

### Get Task Dependencies
```http
GET /api/tasks/{taskId}/dependencies
Authorization: Bearer <token>
```

### Add Task Dependency
```http
POST /api/tasks/{taskId}/dependencies
Authorization: Bearer <token>
Content-Type: application/json

{
  "dependsOnTaskId": 5
}
```

---

## Time Tracking Endpoints

### Get Time Logs
```http
GET /api/projects/{projectId}/tasks/{taskId}/time-logs
Authorization: Bearer <token>
```

### Create Time Log
```http
POST /api/projects/{projectId}/tasks/{taskId}/time-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "minutes": 120,
  "description": "Implemented authentication",
  "date": "2024-12-01"
}
```

### Start Timer
```http
POST /api/timer/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": 1,
  "projectId": 1
}
```

### Stop Timer
```http
POST /api/timer/stop
Authorization: Bearer <token>
```

---

## Invoicing Endpoints

### List Invoices
```http
GET /api/invoices
Authorization: Bearer <token>
```

### Get Invoice Details
```http
GET /api/invoices/{id}
Authorization: Bearer <token>
```

### Create Invoice
```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": 1,
  "clientId": 2,
  "dueDate": "2024-12-31",
  "items": [
    {
      "description": "Web Development",
      "quantity": 1,
      "unitPrice": 50000,
      "taxRate": 13
    }
  ]
}
```

### Get Invoice PDF
```http
GET /api/invoices/{id}/pdf
Authorization: Bearer <token>
```

---

## Payment Endpoints

### Initiate Payment
```http
POST /api/payments/{paymentId}/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "gateway": "KHALTI",
  "returnUrl": "http://localhost:5173/payments/success",
  "cancelUrl": "http://localhost:5173/payments/cancel"
}
```

### Verify Payment
```http
POST /api/payments/verify/{transactionId}
Authorization: Bearer <token>
```

### Refund Payment
```http
POST /api/payments/{paymentId}/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "reason": "Customer request"
}
```

---

## ML Document Processing Endpoints

### Upload Document
```http
POST /api/projects/{projectId}/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

### Get Processing Status
```http
GET /api/projects/{projectId}/documents/{processingId}/status
Authorization: Bearer <token>
```

### Get Task Suggestions
```http
GET /api/projects/{projectId}/documents/{processingId}/suggestions
Authorization: Bearer <token>
```

### Create Tasks from Suggestions
```http
POST /api/projects/{projectId}/documents/{processingId}/create-tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "suggestionIds": [1, 2, 3]
}
```

---

## Search Endpoints

### Global Search
```http
GET /api/search/global?q=website
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "type": "JOB",
    "id": 1,
    "title": "Website Development",
    "description": "Need a modern website",
    "metadata": "Status: OPEN"
  },
  {
    "type": "PROJECT",
    "id": 1,
    "title": "E-commerce Project",
    "description": "Online store development",
    "metadata": "Job: Website Development"
  }
]
```

---

## Sprint Planning Endpoints

### Get Sprints
```http
GET /api/projects/{projectId}/sprints
Authorization: Bearer <token>
```

### Create Sprint
```http
POST /api/projects/{projectId}/sprints
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sprint 1",
  "description": "Initial development sprint",
  "startDate": "2024-12-01",
  "endDate": "2024-12-14",
  "goal": "Complete authentication and user management"
}
```

### Add Task to Sprint
```http
POST /api/projects/{projectId}/sprints/{sprintId}/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": 1
}
```

---

## Admin Endpoints

### Get Platform Analytics
```http
GET /api/admin/analytics/overview
Authorization: Bearer <token>
```

### Get All Users
```http
GET /api/admin/users?page=0&size=20
Authorization: Bearer <token>
```

### Update User
```http
PUT /api/admin/users/{id}
Authorization: Bearer <token>
```

### Get System Settings
```http
GET /api/admin/settings
Authorization: Bearer <token>
```

### Update System Setting
```http
PUT /api/admin/settings/{key}
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": "new_value"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API**: 100 requests per minute per user
- **File uploads**: 10 requests per minute

---

## WebSocket Endpoints

### Real-time Messaging
```
ws://localhost:8080/ws
```

**Subscribe to:**
- `/user/{userId}/queue/messages` - Direct messages
- `/topic/project/{projectId}/messages` - Project messages
- `/user/{userId}/queue/notifications` - Notifications

---

## Notes

- All dates are in ISO 8601 format (YYYY-MM-DD)
- All timestamps are in UTC
- File uploads are limited to 10MB
- JWT tokens expire after 24 hours
- Pagination defaults: page=0, size=20

