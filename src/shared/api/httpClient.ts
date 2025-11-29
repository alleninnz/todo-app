/**
 * HTTP Client with Automatic Case Conversion Interceptors
 *
 * This module provides a configured HTTP client built on Ky with automatic
 * case conversion between frontend (camelCase) and backend (snake_case).
 *
 * @module shared/api/httpClient
 */
import ky, {
  HTTPError,
  type Input,
  type KyInstance,
  type Options,
  type ResponsePromise,
} from 'ky'

import { env } from '@shared/config/env'
import { type ErrorResponse, HttpStatus } from '@shared/types/api.types'

const RETRYABLE_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const
const RETRYABLE_STATUS_CODES = [
  HttpStatus.REQUEST_TIMEOUT,
  HttpStatus.PAYLOAD_TOO_LARGE,
  HttpStatus.TOO_EARLY,
  HttpStatus.TOO_MANY_REQUESTS,
  HttpStatus.INTERNAL_SERVER_ERROR,
  HttpStatus.BAD_GATEWAY,
  HttpStatus.SERVICE_UNAVAILABLE,
  HttpStatus.GATEWAY_TIMEOUT,
] as const

/**
 * Case Conversion Utilities
 * Handles transformation between camelCase (frontend) and snake_case (backend)
 */

const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Recursively transforms object keys using the provided transformer function
 * Handles nested objects and arrays
 */
const transformKeys = (
  obj: unknown,
  transformer: (key: string) => string
): unknown => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer))
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        const newKey = transformer(key)
        acc[newKey] = transformKeys(value, transformer)
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  return obj
}

/**
 * Converts object keys from camelCase to snake_case
 * Used for request payloads going to the backend
 */
const toSnakeCaseKeys = (obj: unknown): unknown =>
  transformKeys(obj, toSnakeCase)

/**
 * Converts object keys from snake_case to camelCase
 * Used for response payloads coming from the backend
 */
const toCamelCaseKeys = (obj: unknown): unknown =>
  transformKeys(obj, toCamelCase)

/**
 * Enhanced debug logging with structured output
 */
const debugLog = (
  direction: '→' | '←' | '×',
  method: string,
  url: string,
  details?: {
    status?: number
    headers?: Record<string, string>
    body?: unknown
    duration?: number
  }
): void => {
  if (!env.VITE_ENABLE_DEBUG || import.meta.env.MODE === 'test') {
    return
  }

  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    direction,
    method,
    url,
    ...details,
  }

  console.info('[http]', direction, method, url, details || '')
  console.debug('[http:detail]', logData)
}

/**
 * Safely parses response payload, handling both JSON and text responses
 */
const parseResponsePayload = async (response?: Response): Promise<unknown> => {
  if (!response) {
    return undefined
  }

  try {
    const clone = response.clone()
    const text = await clone.text()

    if (!text) {
      return undefined
    }

    // Try parsing as JSON first
    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }

    return text
  } catch {
    return undefined
  }
}

/**
 * Extracts request body for logging purposes
 */
const extractRequestBody = async (request: Request): Promise<unknown> => {
  try {
    const clone = request.clone()
    const contentType = clone.headers.get('content-type')

    if (!contentType || clone.method === 'GET' || clone.method === 'HEAD') {
      return undefined
    }

    if (contentType.includes('application/json')) {
      return await clone.json()
    }

    if (contentType.includes('text/')) {
      return await clone.text()
    }

    return '[Binary Data]'
  } catch {
    return undefined
  }
}

/**
 * Extracts headers as a plain object for logging
 */
const extractHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    // Exclude sensitive headers from logs
    if (
      !['authorization', 'cookie', 'set-cookie'].includes(key.toLowerCase())
    ) {
      result[key] = value
    }
  })
  return result
}

export interface ApiErrorOptions extends Partial<ErrorResponse> {
  message: string
  status?: number
  statusText?: string
  url?: string
  cause?: unknown
}

/**
 * Custom API Error class that combines HTTP info with ErrorResponse details
 * This provides a flat structure for easy error handling
 */
export class ApiError extends Error implements ErrorResponse {
  public readonly status?: number
  public readonly statusText?: string
  public readonly url?: string

  // Implementation of ErrorResponse
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly requestId: string
  public readonly timestamp: string

  constructor({
    message,
    status,
    statusText,
    url,
    cause,
    // ErrorResponse fields with defaults
    code = 'UNKNOWN_ERROR',
    details,
    requestId = '',
    timestamp = new Date().toISOString(),
  }: ApiErrorOptions) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.url = url

    this.code = code
    this.details = details
    this.requestId = requestId
    this.timestamp = timestamp

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

const http: KyInstance = ky.create({
  prefixUrl: env.VITE_API_BASE_URL,
  timeout: env.VITE_TIMEOUT,
  retry: {
    limit: env.VITE_API_RETRY_COUNT,
    methods: [...RETRYABLE_METHODS],
    statusCodes: [...RETRYABLE_STATUS_CODES],
  },
  hooks: {
    beforeRequest: [
      async request => {
        const method = request.method?.toUpperCase() ?? 'GET'

        // Set default headers if not present
        if (!request.headers.has('Accept')) {
          request.headers.set('Accept', 'application/json')
        }
        if (
          !request.headers.has('Content-Type') &&
          ['POST', 'PUT', 'PATCH'].includes(method)
        ) {
          request.headers.set('Content-Type', 'application/json')
        }

        // Transform request body to snake_case for backend
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          try {
            const contentType = request.headers.get('Content-Type')
            if (contentType?.includes('application/json')) {
              const bodyClone = request.clone()
              const originalBody = await bodyClone.json()
              const transformedBody = toSnakeCaseKeys(originalBody)

              // Replace the request body with transformed version
              const newRequest = new Request(request, {
                body: JSON.stringify(transformedBody),
              })

              return newRequest
            }
          } catch (error) {
            // If body parsing fails, continue with original request
            if (env.VITE_ENABLE_DEBUG) {
              console.warn('[http] Failed to transform request body:', error)
            }
          }
        }

        // Enhanced logging with request body
        if (env.VITE_ENABLE_DEBUG) {
          const body = await extractRequestBody(request)
          debugLog('→', method, request.url, {
            headers: extractHeaders(request.headers),
            body,
          })
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        const method = request.method?.toUpperCase() ?? 'GET'

        // Transform response body from snake_case to camelCase
        if (response.ok) {
          try {
            const contentType = response.headers.get('Content-Type')
            if (contentType?.includes('application/json')) {
              const originalBody = await response.json()
              const transformedBody = toCamelCaseKeys(originalBody)

              // Create a new response with transformed body
              const transformedResponse = new Response(
                JSON.stringify(transformedBody),
                {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers,
                }
              )

              // Enhanced logging with transformed response body
              if (env.VITE_ENABLE_DEBUG) {
                debugLog('←', method, request.url, {
                  status: response.status,
                  headers: extractHeaders(response.headers),
                  body: transformedBody,
                })
              }

              return transformedResponse
            }
          } catch (error) {
            // If transformation fails, log and return original response
            if (env.VITE_ENABLE_DEBUG) {
              console.warn('[http] Failed to transform response body:', error)
            }
          }
        }

        // Enhanced logging with response body for non-JSON or failed transformations
        if (env.VITE_ENABLE_DEBUG) {
          const body = await parseResponsePayload(response)
          debugLog('←', method, request.url, {
            status: response.status,
            headers: extractHeaders(response.headers),
            body,
          })
        }

        return response
      },
    ],
    beforeError: [
      async error => {
        if (error instanceof HTTPError) {
          const { response, request } = error
          const data = await parseResponsePayload(response)
          const method = request.method?.toUpperCase() ?? 'UNKNOWN'

          // Enhanced error logging
          if (env.VITE_ENABLE_DEBUG) {
            debugLog('×', method, response?.url ?? request.url, {
              status: response?.status,
              headers: response ? extractHeaders(response.headers) : undefined,
              body: data,
            })
          }

          // Attach parsed error data to the HTTPError for later extraction
          Object.assign(error, { parsedData: data })
        } else {
          const errorObj = error as Error

          if (env.VITE_ENABLE_DEBUG) {
            debugLog('×', 'ERROR', errorObj.name, {
              body: errorObj.message,
            })
          }
        }

        return error
      },
    ],
  },
})

export type HttpRequestOptions = Omit<
  Options,
  'prefixUrl' | 'retry' | 'timeout' | 'hooks'
>

type JsonHandler = (
  input: Input,
  options?: HttpRequestOptions
) => ResponsePromise<unknown>

/**
 * Transforms HTTPError into ApiError with parsed response data
 */
const transformError = async (error: unknown): Promise<never> => {
  if (error instanceof HTTPError) {
    const { response } = error
    // Use the data we attached in beforeError hook
    const parsedData = (error as HTTPError & { parsedData?: unknown })
      .parsedData

    // Try to interpret the parsed data as an ErrorResponse
    let errorResponse: Partial<ErrorResponse> = {}

    if (parsedData && typeof parsedData === 'object') {
      // Basic duck typing to check if it looks like our ErrorResponse
      const candidate = parsedData as Record<string, unknown>
      // We should try to use the message even if code is missing
      if (typeof candidate.message === 'string') {
        errorResponse.message = candidate.message
      }
      if (typeof candidate.code === 'string') {
        errorResponse = {
          ...errorResponse,
          ...(parsedData as unknown as ErrorResponse),
        }
      }
    }

    throw new ApiError({
      message: errorResponse.message ?? response?.statusText ?? error.message,
      status: response?.status,
      statusText: response?.statusText,
      url: response?.url,
      cause: error,
      // Spread the parsed error response fields directly
      code: errorResponse.code,
      details: errorResponse.details,
      requestId: errorResponse.requestId,
      timestamp: errorResponse.timestamp,
    })
  }

  const errorObj = error as Error
  throw new ApiError({
    message: errorObj?.message ?? 'An unexpected error occurred',
    cause: errorObj,
  })
}

const asJsonResponse =
  (handler: JsonHandler) =>
  async <T>(input: Input, options?: HttpRequestOptions): Promise<T> => {
    try {
      return await handler(input, options).json<T>()
    } catch (error) {
      return await transformError(error)
    }
  }

export const httpClient = {
  raw: http,
  request: asJsonResponse(http),
  get: asJsonResponse(http.get.bind(http)),
  post: asJsonResponse(http.post.bind(http)),
  put: asJsonResponse(http.put.bind(http)),
  patch: asJsonResponse(http.patch.bind(http)),
  delete: asJsonResponse(http.delete.bind(http)),
}

export type HttpClient = typeof httpClient
