export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
}

/**
 * Returns a basic success response without data.
 */
export function successResponse(message = 'Success', statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
  };
}

/**
 * Returns a success response containing data.
 */
export function successResponseWithData<T>(data: T, message = 'Success', statusCode = 200): StandardResponse<T> {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
}

/**
 * Returns a basic failure response with a message.
 */
export function failureResponse(message = 'Operation failed', statusCode = 400) {
  return {
    success: false,
    statusCode,
    message,
  };
}

/**
 * Returns a failure response including detailed error context.
 */
export function failureResponseWithError(error: any, message = 'An error occurred', statusCode = 400) {
  return {
    success: false,
    statusCode,
    message,
    error: error instanceof Error ? error.message : error,
  };
}