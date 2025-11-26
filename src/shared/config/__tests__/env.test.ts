import { describe, it, expect, vi } from 'vitest'
import { parseEnv, envSchema, env } from '../env'

describe('shared/config/env', () => {
  describe('envSchema', () => {
    it('should have default values', () => {
      const result = envSchema.parse({})
      expect(result.VITE_ENABLE_DEBUG).toBe(false)
      expect(result.VITE_ENABLE_MSW).toBe(false)
      expect(result.VITE_API_RETRY_COUNT).toBe(3)
      expect(result.VITE_SNACKBAR_MAX_COUNT).toBe(3)
      expect(result.VITE_SNACKBAR_AUTO_HIDE).toBe(4000)
      expect(result.VITE_APP_NAME).toBe('TodoAPP')
      expect(result.VITE_API_BASE_URL).toBe('http://localhost:3000')
      expect(result.VITE_TIMEOUT).toBe(10000)
    })

    it('should validate VITE_API_RETRY_COUNT range', () => {
      expect(() => envSchema.parse({ VITE_API_RETRY_COUNT: -1 })).toThrow()
      expect(() => envSchema.parse({ VITE_API_RETRY_COUNT: 6 })).toThrow()
      expect(
        envSchema.parse({ VITE_API_RETRY_COUNT: 0 }).VITE_API_RETRY_COUNT
      ).toBe(0)
      expect(
        envSchema.parse({ VITE_API_RETRY_COUNT: 5 }).VITE_API_RETRY_COUNT
      ).toBe(5)
    })

    it('should validate VITE_SNACKBAR_MAX_COUNT range', () => {
      expect(() => envSchema.parse({ VITE_SNACKBAR_MAX_COUNT: 0 })).toThrow()
      expect(() => envSchema.parse({ VITE_SNACKBAR_MAX_COUNT: 11 })).toThrow()
    })

    it('should validate VITE_SNACKBAR_AUTO_HIDE range', () => {
      expect(() => envSchema.parse({ VITE_SNACKBAR_AUTO_HIDE: 999 })).toThrow()
      expect(() =>
        envSchema.parse({ VITE_SNACKBAR_AUTO_HIDE: 10001 })
      ).toThrow()
    })

    it('should validate VITE_TIMEOUT range', () => {
      expect(() => envSchema.parse({ VITE_TIMEOUT: 999 })).toThrow()
      expect(() => envSchema.parse({ VITE_TIMEOUT: 30001 })).toThrow()
    })

    it('should coerce types', () => {
      const result = envSchema.parse({
        VITE_ENABLE_DEBUG: 'true',
        VITE_API_RETRY_COUNT: '4',
      })
      expect(result.VITE_ENABLE_DEBUG).toBe(true)
      expect(result.VITE_API_RETRY_COUNT).toBe(4)
    })
  })

  describe('parseEnv', () => {
    it('should return parsed env for valid input', () => {
      const input = { VITE_APP_NAME: 'TestApp' }
      const result = parseEnv(input)
      expect(result.VITE_APP_NAME).toBe('TestApp')
    })

    it('should throw error for invalid input', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => parseEnv({ VITE_API_RETRY_COUNT: 100 })).toThrow(
        'Invalid environment variables'
      )
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should log success if debug enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      parseEnv({ VITE_ENABLE_DEBUG: true })
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Environment variables loaded successfully:',
        expect.anything()
      )
      consoleSpy.mockRestore()
    })
  })

  describe('env export', () => {
    it('should be defined', () => {
      expect(env).toBeDefined()
    })
  })
})
