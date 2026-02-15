# Test Setup Guide

This document describes the test suite created for the web client application.

## Test Files Created

14 comprehensive test files have been created to provide full coverage of the changed code:

1. **src/app/auth/auth-context.test.tsx** - Tests for AuthProvider context and hooks
2. **src/app/_components/login-button.test.tsx** - Tests for LoginButton and DevLoginButton components
3. **src/app/login/actions.test.ts** - Tests for login and devLogin server actions
4. **src/app/auth/callback/route.test.ts** - Tests for OAuth callback route handler
5. **src/app/auth/error/page.test.tsx** - Tests for error page component
6. **src/app/login/page.test.tsx** - Tests for login page component
7. **src/app/page.test.tsx** - Tests for home page component
8. **src/app/layout.test.tsx** - Tests for root layout, metadata, and provider nesting
9. **src/env.test.ts** - Tests for environment variable validation
10. **src/proxy.test.ts** - Tests for middleware proxy
11. **src/server/api/root.test.ts** - Tests for tRPC router setup
12. **src/server/api/routers/user/user.test.ts** - Tests for user router and upsert mutation
13. **src/server/api/trpc.test.ts** - Tests for tRPC context and procedures
14. **src/app/api/trpc/[trpc]/route.test.ts** - Tests for tRPC API route handler

## Configuration Files

- **bunfig.toml** - Bun test runner configuration
- **test-setup.ts** - Test environment setup with required environment variables
- **package.json** - Added `"test": "bun test"` script

## Required Dependencies

Before running tests, install the following development dependencies:

```bash
bun add -d @testing-library/react @testing-library/dom @testing-library/jest-dom happy-dom @types/bun
```

These dependencies provide:
- **@testing-library/react** - Testing utilities for React components
- **@testing-library/dom** - DOM testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **happy-dom** - Lightweight DOM implementation for testing
- **@types/bun** - TypeScript types for Bun's test API

## Running Tests

To run all tests:

```bash
bun test
```

To run a specific test file:

```bash
bun test src/app/auth/auth-context.test.tsx
```

To run tests in watch mode:

```bash
bun test --watch
```

## Test Coverage

The test suite covers:

### React Components
- **AuthProvider** - Context provider with state management, login handlers, error handling
- **LoginButton** - Login button with loading states, error handling, provider-specific logic
- **DevLoginButton** - Development-only demo login button
- **PageError** - Error page rendering and navigation
- **LoginPage** - Login page layout and conditional rendering
- **RootLayout** - Root layout component with provider nesting
- **Home** - Home page component

### Server Actions
- **login()** - OAuth login flow, session checks, redirects
- **devLogin()** - Development password login with validation

### Route Handlers
- **OAuth callback** - Code exchange, user upsert, error handling
- **tRPC route** - Request handling, context creation, error logging

### API Layer
- **tRPC context** - Authentication, database connection, error handling
- **User router** - User upsert mutation with metadata extraction
- **App router** - Router configuration and exports

### Utilities
- **env.ts** - Environment variable validation
- **proxy.ts** - Middleware configuration and session handling

## Test Patterns

The tests follow these patterns:

1. **Mocking** - All external dependencies are mocked to isolate unit tests
2. **Comprehensive coverage** - Tests cover happy paths, error cases, edge cases, and boundary conditions
3. **Clear assertions** - Each test has focused, descriptive assertions
4. **Setup/teardown** - Proper cleanup using beforeEach/afterEach
5. **Type safety** - Full TypeScript support with proper typing

## Notes

- Tests use Bun's native test runner (Jest-compatible API)
- React component tests use @testing-library/react
- Server-side code is tested with mocked dependencies
- Environment variables are set in test-setup.ts
- All tests are isolated and can run in parallel