import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { httpClient, ApiError } from '../httpClient'
import { env } from '@shared/config'
import { server } from '@test/mocks/server'
import { HttpStatus } from '@/shared/types'

describe('shared/api/httpClient', () => {
  const baseUrl = env.VITE_API_BASE_URL

  describe('Request Transformation (camelCase -> snake_case)', () => {
    it('should transform request body keys to snake_case for POST requests', async () => {
      let capturedBody: unknown

      server.use(
        http.post(`${baseUrl}/users`, async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({ id: 1 })
        })
      )

      await httpClient.post('users', {
        json: {
          firstName: 'John',
          lastName: 'Doe',
          contactInfo: {
            emailAddress: 'john@example.com',
            phoneNumber: '123-456',
          },
        },
      })

      expect(capturedBody).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        contact_info: {
          email_address: 'john@example.com',
          phone_number: '123-456',
        },
      })
    })

    it('should transform request body keys for PUT requests', async () => {
      let capturedBody: unknown

      server.use(
        http.put(`${baseUrl}/users/1`, async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({ id: 1 })
        })
      )

      await httpClient.put('users/1', {
        json: { isActive: true },
      })

      expect(capturedBody).toEqual({
        is_active: true,
      })
    })
  })

  describe('Response Transformation (snake_case -> camelCase)', () => {
    it('should transform response body keys to camelCase', async () => {
      server.use(
        http.get(`${baseUrl}/users/1`, () => {
          return HttpResponse.json({
            user_id: 1,
            first_name: 'Jane',
            created_at: '2024-01-01',
            roles_list: ['admin', 'editor'],
          })
        })
      )

      const response = await httpClient.get<unknown>('users/1')

      expect(response).toEqual({
        userId: 1,
        firstName: 'Jane',
        createdAt: '2024-01-01',
        rolesList: ['admin', 'editor'],
      })
    })

    it('should handle nested objects and arrays in response', async () => {
      server.use(
        http.get(`${baseUrl}/complex`, () => {
          return HttpResponse.json({
            items_list: [
              { item_id: 1, item_name: 'A' },
              { item_id: 2, item_name: 'B' },
            ],
            meta_data: {
              page_count: 5,
            },
          })
        })
      )

      const response = await httpClient.get<unknown>('complex')

      expect(response).toEqual({
        itemsList: [
          { itemId: 1, itemName: 'A' },
          { itemId: 2, itemName: 'B' },
        ],
        metaData: {
          pageCount: 5,
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw ApiError with correct properties for 400 Bad Request', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: { field: 'email', reason: 'invalid format' },
        requestId: 'req-123',
        timestamp: '2024-01-01T12:00:00Z',
      }

      server.use(
        http.post(`${baseUrl}/users`, () => {
          return HttpResponse.json(errorResponse, {
            status: 400,
            statusText: 'Bad Request',
          })
        })
      )

      try {
        await httpClient.post('users', { json: {} })
        // Fail test if no error thrown
        expect.fail('Should have thrown ApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        if (error instanceof ApiError) {
          // HTTP properties
          expect(error.status).toBe(HttpStatus.BAD_REQUEST)
          expect(error.statusText).toBe('Bad Request')

          // ErrorResponse properties (flat)
          expect(error.code).toBe('VALIDATION_ERROR')
          expect(error.message).toBe('Invalid input data')
          expect(error.details).toEqual({
            field: 'email',
            reason: 'invalid format',
          })
          expect(error.requestId).toBe('req-123')
          expect(error.timestamp).toBe('2024-01-01T12:00:00Z')
        }
      }
    })

    it('should handle 500 Internal Server Error', async () => {
      server.use(
        http.get(`${baseUrl}/crash`, () => {
          return HttpResponse.json(
            { code: 'INTERNAL_ERROR', message: 'Server crashed' },
            { status: 500 }
          )
        })
      )

      await expect(httpClient.get('crash')).rejects.toThrow('Server crashed')
    })

    it('should handle network errors (fetch failure)', async () => {
      server.use(
        http.get(`${baseUrl}/network-fail`, () => {
          return HttpResponse.error()
        })
      )

      try {
        await httpClient.get('network-fail')
        expect.fail('Should have thrown ApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        if (error instanceof ApiError) {
          expect(error.code).toBe('UNKNOWN_ERROR') // Default
          expect(error.message).toBeTruthy()
        }
      }
    })

    it('should handle malformed error responses gracefully', async () => {
      // Backend returns non-standard error format
      server.use(
        http.get(`${baseUrl}/weird-error`, () => {
          return HttpResponse.json(
            { error_msg: 'Legacy error format' },
            { status: 400 }
          )
        })
      )

      try {
        await httpClient.get('weird-error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        if (error instanceof ApiError) {
          expect(error.status).toBe(400)
          // Should fall back to status text or default message if parsing fails strict check
          expect(error.code).toBe('UNKNOWN_ERROR')
        }
      }
    })
  })

  describe('Headers & Configuration', () => {
    it('should send default Accept and Content-Type headers', async () => {
      let capturedHeaders: Headers | undefined

      server.use(
        http.post(`${baseUrl}/headers`, async ({ request }) => {
          capturedHeaders = request.headers
          return HttpResponse.json({ ok: true })
        })
      )

      await httpClient.post('headers', { json: {} })

      expect(capturedHeaders?.get('Accept')).toBe('application/json')
      expect(capturedHeaders?.get('Content-Type')).toBe('application/json')
    })
  })
})
