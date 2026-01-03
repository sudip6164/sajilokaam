# E2E Tests

This directory contains end-to-end tests for the SajiloKaam frontend using Playwright.

## Setup

Tests are already configured. Playwright should be installed.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/login.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

## Test Files

- `login.spec.ts` - Tests for login page functionality
- `signup.spec.ts` - Tests for signup page functionality

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import `test` and `expect` from `@playwright/test`
3. Use `test.describe` to group related tests
4. Use `test.beforeEach` for setup
5. Write test cases using `test('description', async ({ page }) => { ... })`

## Notes

- The app uses a custom router, so navigation is handled via button clicks, not URL changes
- Tests wait for elements to be visible rather than URL changes
- Make sure the dev server is running on `http://localhost:5173` (or tests will start it automatically)

