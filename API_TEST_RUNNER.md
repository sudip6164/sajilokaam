# API Integration Test Runner

This document explains how to run automated API endpoint tests.

## Prerequisites

1. **Docker Compose must be running**:
   ```bash
   docker-compose up -d mysql backend
   ```
   Or run the full stack:
   ```bash
   docker-compose up
   ```

2. **Backend must be accessible** at `http://localhost:8080`

3. **Database must be initialized** (Flyway migrations should have run)

## Running the Tests

### Option 1: Run All API Tests
```bash
cd backend
./mvnw test -Dtest=ApiIntegrationTest
```

### Option 2: Run with Maven (Windows)
```bash
cd backend
mvnw.cmd test -Dtest=ApiIntegrationTest
```

### Option 3: Run from IDE
- Right-click on `ApiIntegrationTest.java`
- Select "Run ApiIntegrationTest"

## What Gets Tested

The test suite automatically tests:

### ✅ Authentication
- Health check
- Login with valid credentials
- Login with invalid credentials

### ✅ Dispute Resolution (NEW)
- Get all disputes (admin)
- Get my disputes
- Create dispute
- (Resolution tested via admin endpoints)

### ✅ Subtasks (NEW)
- Get subtasks for a task
- Create subtask
- Update subtask status
- Delete subtask

### ✅ Projects
- Get all projects
- Get project by ID

### ✅ Tasks
- Get tasks for project
- Create task

### ✅ Task Labels
- Get all task labels
- Create task label

### ✅ Jobs
- Get all jobs

### ✅ Admin Endpoints
- Admin dashboard stats
- Get all users

## Test Output

The tests will output:
- ✅ Green checkmarks for passing tests
- ❌ Red X for failing tests
- Summary at the end showing:
  - Total tests run
  - Tests passed
  - Tests failed
  - Time taken

## Understanding Test Results

### Success Indicators
- `assertEquals(HttpStatus.OK, ...)` - Endpoint returns 200
- `assertNotNull(...)` - Response contains data
- `assertEquals(...)` - Response data matches expected

### Common Issues

**401 Unauthorized**
- Token might be expired
- User might not exist in test database
- Solution: Check that seed data includes `admin@sajilokaam.com`

**404 Not Found**
- Resource doesn't exist (e.g., project ID 999)
- This is expected for some tests that use fallback IDs
- Tests handle this gracefully

**500 Internal Server Error**
- Database connection issue
- Backend not fully started
- Solution: Check backend logs, ensure database is running

## Adding More Tests

To add tests for additional endpoints:

1. Add a new `@Test` method in `ApiIntegrationTest.java`
2. Use the helper methods:
   - `createAuthHeaders(token)` - Create authenticated request headers
   - `getOrCreateTestProject()` - Get a valid project ID
   - `getOrCreateTestTask()` - Get a valid task ID

Example:
```java
@Test
@DisplayName("Your Test Name")
void testYourEndpoint() {
    HttpHeaders headers = createAuthHeaders(userToken);
    HttpEntity<?> request = new HttpEntity<>(headers);
    
    ResponseEntity<Map> response = restTemplate.exchange(
        baseUrl + "/your/endpoint",
        HttpMethod.GET,
        request,
        Map.class
    );
    
    assertEquals(HttpStatus.OK, response.getStatusCode());
}
```

## Continuous Integration

These tests can be integrated into CI/CD:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    docker-compose up -d mysql backend
    sleep 30  # Wait for services
    cd backend
    ./mvnw test -Dtest=ApiIntegrationTest
```

## Test Data

The tests use:
- **Admin user**: `admin@sajilokaam.com` / `admin123` (from seed data)
- **Test user**: Created dynamically during test setup
- **Test resources**: Created on-the-fly or uses existing data

## Notes

- Tests are **integration tests** - they hit the real API
- Tests may create test data in the database
- Some tests may fail if seed data is missing
- Tests are designed to be **idempotent** where possible

## Troubleshooting

**Tests fail with connection refused**
- Ensure backend is running: `docker ps`
- Check backend logs: `docker logs sajilokaam-backend`

**Tests fail with database errors**
- Ensure MySQL is running: `docker ps`
- Check database connection in `application-test.properties`

**Tests timeout**
- Backend might be slow to start
- Increase timeout in test configuration
- Check backend health: `curl http://localhost:8080/actuator/health`

