import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { httpClient, ApiError } from '../httpClient'
import { env } from '@shared/config/env'
import { server } from '../../../test/mocks/server'

describe('shared/api/httpClient', () => {
  const baseUrl = env.VITE_API_BASE_URL

  it('should transform request body to snake_case', async () => {
    let capturedBody: unknown

    server.use(
      http.post(`${baseUrl}/test-case`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ success: true })
      })
    )

    await httpClient.post('test-case', {
      json: {
        firstName: 'John',
        lastName: 'Doe',
        userSettings: {
          themeMode: 'dark',
        },
      },
    })

    expect(capturedBody).toEqual({
      first_name: 'John',
      last_name: 'Doe',
      user_settings: {
        theme_mode: 'dark',
      },
    })
  })

  it('should transform response body to camelCase', async () => {
    server.use(
      http.get(`${baseUrl}/test-case`, () => {
        return HttpResponse.json({
          first_name: 'Jane',
          last_name: 'Doe',
          user_settings: {
            theme_mode: 'light',
          },
        })
      })
    )

    const response = await httpClient.get<unknown>('test-case')

    expect(response).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
      userSettings: {
        themeMode: 'light',
      },
    })
  })

  it('should handle HTTP errors and throw ApiError', async () => {
    server.use(
      http.get(`${baseUrl}/error`, () => {
        return HttpResponse.json(
          { message: 'Something went wrong', error_code: 'INVALID_INPUT' },
          { status: 400, statusText: 'Bad Request' }
        )
      })
    )

    await expect(httpClient.get('error')).rejects.toThrow(ApiError)

    try {
      await httpClient.get('error')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.status).toBe(400)
        expect(error.statusText).toBe('Bad Request')
        expect(error.message).toBe('Something went wrong')
      }
    }
  })

  it('should handle network errors', async () => {
    server.use(
      http.get(`${baseUrl}/network-error`, () => {
        return HttpResponse.error()
      })
    )

    await expect(httpClient.get('network-error')).rejects.toThrow(ApiError)
  })
})
