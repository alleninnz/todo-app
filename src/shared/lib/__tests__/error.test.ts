import { describe, it, expect } from 'vitest'
import {
  isNetworkError,
  extractStatusCode,
  getErrorInfo,
  HTTP_ERROR_MESSAGES,
  DEFAULT_ERROR_INFO,
  COMPONENT_ERROR_INFO,
  NETWORK_ERROR_INFO,
} from '../error'

describe('shared/lib/error', () => {
  describe('isNetworkError', () => {
    it('should return true for errors with network-related messages', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true)
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true)
      expect(isNetworkError(new Error('Connection timed out'))).toBe(true)
    })

    it('should return true for errors with network-related names', () => {
      const error = new Error('Some error')
      error.name = 'TypeError [ERR_INVALID_URL]' // Not network
      expect(isNetworkError(error)).toBe(false)

      const netError = new Error('Some error')
      netError.name = 'NetworkError'
      expect(isNetworkError(netError)).toBe(true)
    })

    it('should return true for specific status codes', () => {
      expect(isNetworkError({ status: 502 })).toBe(true)
      expect(isNetworkError({ status: 504 })).toBe(true)
      expect(isNetworkError({ status: 500 })).toBe(false)
    })

    it('should return false for non-network errors', () => {
      expect(isNetworkError(new Error('Something went wrong'))).toBe(false)
      expect(isNetworkError(null)).toBe(false)
      expect(isNetworkError({})).toBe(false)
    })
  })

  describe('extractStatusCode', () => {
    it('should extract status from error.status', () => {
      expect(extractStatusCode({ status: 404 })).toBe(404)
    })

    it('should extract status from error.statusCode', () => {
      expect(extractStatusCode({ statusCode: 401 })).toBe(401)
    })

    it('should extract status from error.response.status', () => {
      expect(extractStatusCode({ response: { status: 500 } })).toBe(500)
    })

    it('should extract status from error.code if it is a number', () => {
      expect(extractStatusCode({ code: 403 })).toBe(403)
    })

    it('should extract status from error.code string if it contains 3 digits', () => {
      expect(extractStatusCode({ code: 'ERR_404' })).toBe(404)
    })

    it('should return null if no status code found', () => {
      expect(extractStatusCode(new Error('oops'))).toBe(null)
      expect(extractStatusCode({})).toBe(null)
    })
  })

  describe('getErrorInfo', () => {
    it('should return network error info for network errors', () => {
      const error = new Error('Network error')
      const result = getErrorInfo(error)
      expect(result.statusCode).toBe(0)
      expect(result.errorInfo).toEqual(NETWORK_ERROR_INFO)
    })

    it('should return specific error info for known HTTP status codes', () => {
      const result = getErrorInfo({ status: 404 })
      expect(result.statusCode).toBe(404)
      expect(result.errorInfo).toEqual(HTTP_ERROR_MESSAGES[404])
    })

    it('should return component error info for status 500 without explicit status extraction', () => {
      // If extractStatusCode returns null, but we default to 500 in getErrorInfo logic?
      // Wait, looking at the code:
      // const extractedStatus = extractStatusCode(error)
      // const statusCode = extractedStatus ?? 500
      // if (!extractedStatus && statusCode === 500) -> COMPONENT_ERROR_INFO

      const error = new Error('Runtime error')
      const result = getErrorInfo(error)
      expect(result.statusCode).toBe(500)
      expect(result.errorInfo).toEqual(COMPONENT_ERROR_INFO)
    })

    it('should return default error info for unknown status codes', () => {
      const result = getErrorInfo({ status: 418 }) // I'm a teapot
      expect(result.statusCode).toBe(418)
      expect(result.errorInfo).toEqual(DEFAULT_ERROR_INFO)
    })
  })
})
