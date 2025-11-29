// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_EARLY: 425,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus]

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Standard error response structure (FLAT - not wrapped)
 * Backend returns this directly for all non-2xx responses
 */
export interface ErrorResponse<T = Record<string, unknown>> {
  /** Machine-readable error code (SCREAMING_SNAKE_CASE) */
  code: string

  /** Human-readable error message */
  message: string

  /**
   * Flexible error context - structure varies by error code
   * - For `VALIDATION_ERROR`: Contains `fields` array
   * - For `CONFLICT`: Contains conflicting resource info
   */
  details?: T

  /** ISO 8601 timestamp when error occurred */
  timestamp: string

  /** Unique request identifier for debugging/support */
  requestId: string
}

// ============================================================================
// Success Response Types
// ============================================================================

/**
 * Generic API response wrapper.
 * Currently, the API returns domain types directly, so this is an alias.
 * Use this type to wrap return values for consistency and future-proofing.
 *
 * @example
 * function getTask(): Promise<ApiResponse<Task>> { ... }
 */
export type ApiResponse<T> = T

/**
 * Standard paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// HTTP Status Code Reference
// ============================================================================

/**
 * Standard HTTP status codes:
 *
 * SUCCESS:
 * - 200 OK: GET, PUT, PATCH successful → returns data directly
 * - 201 Created: POST successful → returns created resource
 * - 204 No Content: DELETE successful → no response body
 *
 * CLIENT ERRORS (4xx)
 * - 400 Bad Request: code = VALIDATION_ERROR
 * - 401 Unauthorized: code = UNAUTHORIZED
 * - 403 Forbidden: code = FORBIDDEN
 * - 404 Not Found: code = NOT_FOUND
 * - 409 Conflict: code = CONFLICT
 *
 * SERVER ERRORS (5xx)
 * - 500 Internal Server Error: code = INTERNAL_ERROR
 */
