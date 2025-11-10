import ky, {
  HTTPError,
  type Input,
  type KyInstance,
  type Options,
  type ResponsePromise,
} from 'ky'

import { env } from '@shared/config/env'

const RETRYABLE_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const
const RETRYABLE_STATUS_CODES = [408, 413, 425, 429, 500, 502, 503, 504] as const

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
  if (!env.VITE_ENABLE_DEBUG) {
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
async function parseResponsePayload(response?: Response): Promise<unknown> {
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
async function extractRequestBody(request: Request): Promise<unknown> {
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
function extractHeaders(headers: Headers): Record<string, string> {
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

const extractMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>
    if (typeof candidate.message === 'string') {
      return candidate.message
    }

    if (typeof candidate.error === 'string') {
      return candidate.error
    }
  }

  return fallback
}

export interface ApiErrorOptions {
  message: string
  status?: number
  statusText?: string
  url?: string
  data?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  public readonly status?: number
  public readonly statusText?: string
  public readonly url?: string
  public readonly data?: unknown

  constructor({
    message,
    status,
    statusText,
    url,
    data,
    cause,
  }: ApiErrorOptions) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.url = url
    this.data = data

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

        // Enhanced logging with response body and timing
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
    const parsedData = (error as HTTPError & { parsedData?: unknown })
      .parsedData

    throw new ApiError({
      message: extractMessage(
        parsedData,
        response?.statusText ?? error.message
      ),
      status: response?.status,
      statusText: response?.statusText,
      url: response?.url,
      data: parsedData,
      cause: error,
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
