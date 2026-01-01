# End-to-End Testing with Playwright

This directory contains automated E2E tests for the Sajilo Kaam platform.

## What is E2E Testing?

End-to-End (E2E) testing automatically tests your application by simulating real user interactions:
- ✅ Login/Logout flows
- ✅ Form submissions
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Navigation between pages
- ✅ Search functionality
- ✅ User workflows

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### View test report
```bash
npm run test:e2e:report
```

## Test Files & Coverage

### Core Feature Tests

1. **`auth.spec.ts`** - Authentication & Session Management
   - Login with valid/invalid credentials
   - Logout functionality
   - Session persistence
   - Navigation flows

2. **`jobs.spec.ts`** - Job Management
   - Browse jobs (public)
   - View job details
   - Create new job
   - Search and filter jobs
   - Edit jobs
   - View my jobs (client)

3. **`bidding.spec.ts`** - Bidding System
   - Browse available jobs
   - View job details and bid button
   - Submit bids
   - View my bids
   - Filter bids by status

4. **`projects.spec.ts`** - Basic Project Management
   - View projects list
   - View project details
   - Create tasks

5. **`projects-enhanced.spec.ts`** - Advanced Project Management
   - Milestones (create, view, assign tasks)
   - Sprint planning (create sprints, add tasks)
   - Task status updates
   - Task comments

6. **`ml-document.spec.ts`** - ML Document Processing
   - Upload documents
   - Process documents with ML
   - View extracted task suggestions
   - Create tasks from suggestions

7. **`time-tracking.spec.ts`** - Time Tracking
   - Start/stop timer
   - View time logs
   - Timer display

8. **`files.spec.ts`** - File Management
   - Upload files
   - View files list
   - Download files

9. **`messaging.spec.ts`** - Messaging & Conversations
   - View conversations
   - Send messages
   - Navigate to projects from conversations

10. **`payments.spec.ts`** - Payment System
    - View invoices
    - Open payment dialog
    - Select payment methods
    - Initiate eSewa/Khalti payments
    - View payment history

11. **`profiles.spec.ts`** - Profile Management
    - View freelancer/client profiles
    - Edit profile information

### Test Helpers

- **`helpers/auth.ts`** - Authentication helper functions
  - `login()` - Login helper
  - `logout()` - Logout helper
  - `isLoggedIn()` - Check login status
  - `TEST_CREDENTIALS` - Test account credentials

## Prerequisites

1. **Start your Docker services**:
   ```bash
   # Start all services (frontend, backend, mysql, ml-service)
   docker-compose up -d
   
   # Wait for services to be ready
   docker-compose ps
   
   # Check frontend logs to ensure it's running
   docker-compose logs frontend
   ```

2. **Verify services are running**:
   ```bash
   # Check if frontend is accessible (from Docker)
   curl http://localhost:5173
   
   # Check if backend is accessible
   curl http://localhost:8080/api/health
   ```

3. **Install Playwright browsers** (first time only, on your host machine):
   ```bash
   cd frontend
   npx playwright install
   ```

## Running Tests with Docker

Since the frontend runs in Docker, run tests from your **host machine** (not inside the container):

```bash
# 1. Make sure Docker services are running
docker-compose up -d

# 2. Wait for services to be ready (check logs)
docker-compose logs frontend

# 3. Run tests from your host machine
cd frontend
npm run test:e2e
```

**Why run from host?** Playwright needs to install browsers on your system, and it's easier to run from the host where you have full system access.

The tests will automatically connect to `http://localhost:5173` which is exposed from your Docker container.

## Writing New Tests

Create a new file in `e2e/` directory:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-page');
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

## Test Data

Tests use the default admin account:
- Email: `admin@sajilokaam.com`
- Password: `admin123`

For production tests, use test accounts or environment variables.

## CI/CD Integration

These tests can be integrated into CI/CD pipelines to automatically test your application before deployment.

