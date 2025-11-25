/**
 * Error Handling Utilities
 *
 * Provides error categorization, HTTP status code extraction, and error information
 * mapping for consistent error handling across the application.
 *
 * @module shared/lib/error
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Error information for display
 */
export interface ErrorPageInfo {
  /** Error title displayed to user */
  title: string
  /** Descriptive error message */
  message: string
  /** Error category for specialized handling */
  category?: 'client' | 'server' | 'network' | 'auth' | 'unknown'
}

/**
 * Custom action button configuration
 */
export interface ErrorAction {
  /** Button label */
  label: string
  /** Click handler */
  onClick: () => void
  /** Button variant (outlined or contained) */
  variant?: 'outlined' | 'contained'
}

/**
 * Error types that can have HTTP status codes
 */
interface HttpError extends Error {
  status?: number
  statusCode?: number
  code?: string | number
  response?: {
    status?: number
    statusText?: string
  }
}

// ============================================================================
// ERROR CONSTANTS & MAPPINGS
// ============================================================================

/**
 * HTTP error messages configuration
 * Maps status codes to user-friendly error information with categories
 */
export const HTTP_ERROR_MESSAGES: Record<number, ErrorPageInfo> = {
  // Client Errors (4xx)
  400: {
    title: 'Bad Request',
    message:
      'The request could not be understood. Please check your input and try again.',
    category: 'client',
  },
  401: {
    title: 'Unauthorized',
    message: 'You need to be logged in to access this resource.',
    category: 'auth',
  },
  403: {
    title: 'Access Forbidden',
    message: "You don't have permission to access this resource.",
    category: 'auth',
  },
  404: {
    title: 'Page Not Found',
    message: "The page you're looking for doesn't exist or has been moved.",
    category: 'client',
  },

  // Server Errors (5xx)
  500: {
    title: 'Internal Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    category: 'server',
  },
  502: {
    title: 'Bad Gateway',
    message: 'Unable to connect to the server. Please try again later.',
    category: 'network',
  },
  503: {
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
    category: 'server',
  },
  504: {
    title: 'Gateway Timeout',
    message: 'The server took too long to respond. Please try again.',
    category: 'network',
  },
} as const

/**
 * Default error info for unknown status codes
 */
export const DEFAULT_ERROR_INFO: ErrorPageInfo = {
  title: 'An Error Occurred',
  message: 'Something unexpected happened. Please try again.',
  category: 'unknown',
} as const

/**
 * Default error info for component/runtime errors (not HTTP-related)
 */
export const COMPONENT_ERROR_INFO: ErrorPageInfo = {
  title: 'Something Went Wrong',
  message:
    'We encountered an unexpected error. Please try reloading the page or go back to the home page.',
  category: 'unknown',
} as const

/**
 * Network error info (connection failures, timeouts)
 */
export const NETWORK_ERROR_INFO: ErrorPageInfo = {
  title: 'Network Error',
  message:
    'Unable to connect to the server. Please check your internet connection and try again.',
  category: 'network',
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if error is a network-related error
 *
 * Detects network errors by checking error messages, names, and status codes
 * for common network-related patterns.
 *
 * @param error - Error object to check
 * @returns True if error is network-related
 *
 * @example
 * ```ts
 * const error = new Error('Network request failed')
 * isNetworkError(error) // true
 * ```
 *
 * @example
 * ```ts
 * const error = new Error('Cannot read property')
 * isNetworkError(error) // false
 * ```
 */
export const isNetworkError = (error: Error | unknown): boolean => {
  if (!error || typeof error !== 'object') return false

  const err = error as Error
  const httpError = error as HttpError

  // Check common network error patterns
  const networkPatterns = [
    'network',
    'fetch',
    'timeout',
    'connection',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ]

  // Check error message
  if (
    err.message &&
    networkPatterns.some(pattern => err.message.toLowerCase().includes(pattern))
  ) {
    return true
  }

  // Check error name
  if (
    err.name &&
    networkPatterns.some(pattern => err.name.toLowerCase().includes(pattern))
  ) {
    return true
  }

  // Check status codes that indicate network issues
  const networkStatusCodes = [502, 504]
  if (
    typeof httpError.status === 'number' &&
    networkStatusCodes.includes(httpError.status)
  ) {
    return true
  }

  return false
}

/**
 * Extract HTTP status code from various error types
 *
 * Attempts to extract status code from common error patterns:
 * - error.status (Fetch API, Axios)
 * - error.statusCode (HTTP libraries)
 * - error.code (Node.js errors, some HTTP errors)
 * - error.response.status (Axios response pattern)
 *
 * @param error - Error object to extract status from
 * @returns HTTP status code or null if not found
 *
 * @example
 * ```ts
 * const fetchError = new Error('Not found')
 * fetchError.status = 404
 * extractStatusCode(fetchError) // 404
 * ```
 *
 * @example
 * ```ts
 * const axiosError = { response: { status: 500 } }
 * extractStatusCode(axiosError) // 500
 * ```
 *
 * @example
 * ```ts
 * const componentError = new Error('Cannot read property')
 * extractStatusCode(componentError) // null
 * ```
 */
export const extractStatusCode = (error: Error | unknown): number | null => {
  if (!error || typeof error !== 'object') {
    return null
  }

  const httpError = error as HttpError

  // Try common status code properties
  if (typeof httpError.status === 'number') {
    return httpError.status
  }

  if (typeof httpError.statusCode === 'number') {
    return httpError.statusCode
  }

  // Try Axios response pattern
  if (
    httpError.response?.status &&
    typeof httpError.response.status === 'number'
  ) {
    return httpError.response.status
  }

  if (typeof httpError.code === 'number') {
    return httpError.code
  }

  // Try parsing string codes (e.g., "ERR_404", "404")
  if (typeof httpError.code === 'string') {
    const match = httpError.code.match(/\d{3}/)
    if (match) {
      return parseInt(match[0], 10)
    }
  }

  return null
}

/**
 * Get error information from error object
 *
 * Determines appropriate status code and error message for display.
 * Prioritizes HTTP status codes from error objects, detects network errors,
 * falls back to appropriate defaults.
 *
 * **Status Code Priority:**
 * 1. Extracted from error.status, error.statusCode, error.response.status, or error.code
 * 2. Default 0 for network errors (connection failures)
 * 3. Default 500 (Internal Server Error) for component errors
 *
 * **Error Info Priority:**
 * 1. NETWORK_ERROR_INFO for detected network errors
 * 2. HTTP_ERROR_MESSAGES for known status codes
 * 3. COMPONENT_ERROR_INFO for runtime/component errors (status 500)
 * 4. DEFAULT_ERROR_INFO for unknown status codes
 *
 * @param error - Error object to analyze
 * @returns Object with status code and error information
 *
 * @example
 * ```ts
 * // HTTP error with status code
 * const httpError = new Error('Not found')
 * httpError.status = 404
 * getErrorInfo(httpError)
 * // { statusCode: 404, errorInfo: { title: 'Page Not Found', message: '...', category: 'client' } }
 * ```
 *
 * @example
 * ```ts
 * // Network error
 * const networkError = new Error('Network request failed')
 * getErrorInfo(networkError)
 * // { statusCode: 0, errorInfo: { title: 'Network Error', message: '...', category: 'network' } }
 * ```
 *
 * @example
 * ```ts
 * // Component error without status code
 * const componentError = new Error('Cannot read property')
 * getErrorInfo(componentError)
 * // { statusCode: 500, errorInfo: { title: 'Something Went Wrong', message: '...', category: 'unknown' } }
 * ```
 */
export const getErrorInfo = (
  error: Error | unknown
): {
  statusCode: number
  errorInfo: ErrorPageInfo
} => {
  // Check for network errors first
  if (isNetworkError(error)) {
    return {
      statusCode: 0, // Use 0 to indicate network error (not an HTTP status)
      errorInfo: NETWORK_ERROR_INFO,
    }
  }

  // Extract status code from error
  const extractedStatus = extractStatusCode(error)
  const statusCode = extractedStatus ?? 500

  // Get error info based on status code
  let errorInfo: ErrorPageInfo

  if (HTTP_ERROR_MESSAGES[statusCode]) {
    // Known HTTP status code
    errorInfo = HTTP_ERROR_MESSAGES[statusCode]
  } else if (!extractedStatus && statusCode === 500) {
    // Component/runtime error (no HTTP status extracted)
    errorInfo = COMPONENT_ERROR_INFO
  } else {
    // Unknown status code
    errorInfo = DEFAULT_ERROR_INFO
  }

  return { statusCode, errorInfo }
}
