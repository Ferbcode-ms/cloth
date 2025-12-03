import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiError } from '../../types';

/**
 * Standardized API response utilities
 * Ensures consistent response format across all API endpoints
 */
export class ApiResponse {
  /**
   * Success response with data
   */
  static success<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
  }

  /**
   * Error response with message and optional details
   */
  static error(message: string, status = 400, details?: string[]): NextResponse<ApiError> {
    const error: ApiError = { error: message, details };
    return NextResponse.json(error, { status });
  }

  /**
   * Unauthorized error (401)
   */
  static unauthorized(message = 'Unauthorized'): NextResponse<ApiError> {
    return this.error(message, 401);
  }

  /**
   * Not found error (404)
   */
  static notFound(resource = 'Resource'): NextResponse<ApiError> {
    return this.error(`${resource} not found`, 404);
  }

  /**
   * Server error (500)
   */
  static serverError(error: unknown): NextResponse<ApiError> {
    console.error('Server error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return this.error(message, 500);
  }

  /**
   * Validation error from Zod
   */
  static validationError(error: ZodError): NextResponse<ApiError> {
    const errors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return this.error('Validation failed', 400, errors);
  }

  /**
   * Bad request error (400)
   */
  static badRequest(message: string, details?: string[]): NextResponse<ApiError> {
    return this.error(message, 400, details);
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T): NextResponse<T> {
    return NextResponse.json(data, { status: 201 });
  }

  /**
   * No content response (204)
   */
  static noContent() {
    return new NextResponse(null, { status: 204 });
  }
}
