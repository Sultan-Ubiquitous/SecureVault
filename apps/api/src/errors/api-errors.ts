/**
 * Base class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message: string) {
    super(message, 500);
  }
}

/**
 * 409 Conflict (e.g., duplicate ID)
 */
export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
  }
}