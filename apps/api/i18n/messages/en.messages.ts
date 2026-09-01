import type { MessageCode } from './message-codes';

export const en: Record<MessageCode, string> = {
  AUTH_EMAIL_TAKEN: 'This email is already registered',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_ACCOUNT_INACTIVE: 'This account is inactive',
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_UNAUTHORIZED: 'Unauthorized',
  AUTH_SIGNED_UP: 'Registered successfully',
  AUTH_SIGNED_OUT: 'Signed out',
  VALIDATION_PASSWORD_SHORT: 'Password is too short',
  VALIDATION_PASSWORD_LONG: 'Password is too long',
  VALIDATION_PASSWORD_PERSONAL: 'Password must not contain your name or email',
  VALIDATION_FAILED: 'Validation failed',
  RATE_LIMITED: 'Too many requests, please slow down',
  UPLOAD_MIME_NOT_ALLOWED_FOR_FOLDER: 'This file type is not allowed for this folder',
  ADMIN_CANNOT_MODIFY_SELF: "You cannot change your own account's role or active status",
  VEHICLE_CATALOG_BRAND_NOT_FOUND: 'Brand not found',
  VEHICLE_CATALOG_MODEL_NOT_FOUND: 'Model not found',
  VEHICLE_CATALOG_GENERATION_NOT_FOUND: 'Generation not found',
  VEHICLE_CATALOG_ENGINE_OPTION_NOT_FOUND: 'Engine option not found',
  USER_VEHICLE_NOT_FOUND: 'Vehicle not found',
};
