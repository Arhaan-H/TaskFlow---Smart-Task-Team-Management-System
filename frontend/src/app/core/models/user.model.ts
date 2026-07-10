/**
 * USER MODEL
 * ==========
 * TypeScript interfaces that mirror the MongoDB User document schema.
 *
 * In Angular + TypeScript, we define interfaces (not classes) for data shapes
 * coming from the API. Interfaces are compile-time only — they produce NO
 * JavaScript output, making them "free" in terms of bundle size.
 *
 * These interfaces are used:
 * - In services to type HTTP responses
 * - In components to type template variables
 * - In forms to build typed FormGroups
 */

/**
 * User interface - represents a TaskFlow user account.
 * Matches the MongoDB User document structure returned by the API.
 */
export interface User {
  /** MongoDB ObjectId as string (24-char hex) */
  _id: string;

  /** User's full display name */
  name: string;

  /** User's unique email address (used as login credential) */
  email: string;

  /** URL to the user's avatar image, or empty string if none */
  avatar: string;

  /** ISO 8601 date string of when the account was created */
  createdAt: string;
}

/**
 * AuthResponse - shape of the response from POST /api/auth/login
 * and POST /api/auth/register endpoints.
 * The backend returns a JWT token and the user object together.
 */
export interface AuthResponse {
  /** Whether the request was successful */
  success: boolean;

  /** Human-readable message from the server */
  message: string;

  /** JWT (JSON Web Token) - stored in localStorage for subsequent requests */
  token: string;

  /** The authenticated user's data */
  user: User;
}

/**
 * LoginDto - Data Transfer Object for login form submission.
 * DTO pattern: a plain object that carries data between layers.
 * This is sent as the HTTP request body to POST /api/auth/login.
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * RegisterDto - Data Transfer Object for registration form.
 * Sent to POST /api/auth/register.
 * Note: confirmPassword is validated client-side only; the backend doesn't need it.
 */
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * UpdateProfileDto - Partial update for user profile.
 * Only fields that are being changed need to be included.
 */
export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
}

/**
 * ChangePasswordDto - Data for the change password form.
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
