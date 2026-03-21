# Authentication API

## POST /api/v1/auth/signup
Register a new studio and owner account.

- **Body**:
  ```json
  {
    "email": "owner@studio.com",
    "password": "securepassword",
    "fullName": "John Doe",
    "studioName": "Doe Photography",
    "studioSlug": "doe-photography"
  }
  ```
- **Response**: `201 Created`

## POST /api/v1/auth/login
Login with email and password.

- **Response**: `200 OK` with Supabase session.

## POST /api/v1/auth/logout
Sign out and clear session cookies.

## GET /api/v1/auth/me
Get current authenticated user, member role, and studio details.

## POST /api/v1/auth/reset-password
Trigger a password reset email.

## POST /api/v1/auth/update-password
Update password (used after reset or in settings).
