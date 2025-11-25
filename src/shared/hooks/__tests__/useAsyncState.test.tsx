import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAsyncState } from '../useAsyncState'

describe('useAsyncState', () => {
  describe('Initial State', () => {
    it('should initialize with idle status and null data', () => {
      const { result } = renderHook(() => useAsyncState<string>())

      expect(result.current.status).toBe('idle')
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isIdle).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('should accept initial data', () => {
      const initialData = 'initial value'
      const { result } = renderHook(() =>
        useAsyncState<string>({ initialData })
      )

      expect(result.current.data).toBe(initialData)
      expect(result.current.status).toBe('idle')
    })
  })

  describe('Execute Success Flow', () => {
    it('should handle successful async operation', async () => {
      const { result } = renderHook(() => useAsyncState<string>())
      const mockData = 'success data'

      let promise: Promise<string | null>
      await act(async () => {
        promise = result.current.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return mockData
        })
      })

      // Should be loading immediately
      expect(result.current.status).toBe('loading')
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()

      await waitFor(() => expect(result.current.status).toBe('success'))

      expect(result.current.data).toBe(mockData)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.error).toBeNull()

      const returnedData = await promise!
      expect(returnedData).toBe(mockData)
    })

    it('should call onStart, onSuccess, and onFinally callbacks', async () => {
      const onStart = vi.fn()
      const onSuccess = vi.fn()
      const onFinally = vi.fn()

      const { result } = renderHook(() =>
        useAsyncState<string>({
          onStart,
          onSuccess,
          onFinally,
        })
      )

      await act(async () => {
        await result.current.execute(async () => 'data')
      })

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith('data')
      expect(onFinally).toHaveBeenCalledTimes(1)
    })
  })

  describe('Execute Error Flow', () => {
    it('should handle async operation errors', async () => {
      const { result } = renderHook(() => useAsyncState<string>())
      const mockError = new Error('Operation failed')

      let promise: Promise<string | null>
      await act(async () => {
        promise = result.current.execute(async () => {
          throw mockError
        })
        try {
          await promise
        } catch {
          // Expected error
        }
      })

      expect(result.current.error).toBe(mockError)
      expect(result.current.isError).toBe(true)
      expect(result.current.data).toBeNull()
    })

    it('should call onError and onFinally on failure', async () => {
      const onError = vi.fn()
      const onFinally = vi.fn()
      const mockError = new Error('Failed')

      const { result } = renderHook(() =>
        useAsyncState<string>({
          onError,
          onFinally,
        })
      )

      await act(async () => {
        try {
          await result.current.execute(async () => {
            throw mockError
          })
        } catch {
          // Expected error
        }
      })

      expect(onError).toHaveBeenCalledWith(mockError)
      expect(onFinally).toHaveBeenCalledTimes(1)
    })

    it('should clear previous error on new execution', async () => {
      const { result } = renderHook(() => useAsyncState<string>())

      // First execution fails
      await act(async () => {
        try {
          await result.current.execute(async () => {
            throw new Error('First error')
          })
        } catch {
          // Expected error
        }
      })

      expect(result.current.error).toBeTruthy()

      // Second execution starts
      let promise: Promise<string | null>
      act(() => {
        promise = result.current.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'success'
        })
      })

      // Error should be cleared when loading
      expect(result.current.error).toBeNull()
      expect(result.current.status).toBe('loading')

      await act(async () => {
        await promise!
      })

      expect(result.current.status).toBe('success')
    })
  })

  describe('Race Condition Prevention', () => {
    it('should ignore results from stale executions', async () => {
      const { result } = renderHook(() => useAsyncState<string>())

      let slowPromise: Promise<string | null>
      let fastPromise: Promise<string | null>

      // Start first slow execution
      act(() => {
        slowPromise = result.current.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return 'slow'
        })
      })

      // Start second fast execution (this should win)
      act(() => {
        fastPromise = result.current.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'fast'
        })
      })

      await waitFor(() => expect(result.current.status).toBe('success'))

      // Fast execution should have updated the state
      expect(result.current.data).toBe('fast')

      // Wait for slow promise to complete
      const slowResult = await slowPromise!
      expect(slowResult).toBeNull() // Stale execution returns null

      // State should still be from fast execution
      expect(result.current.data).toBe('fast')

      await fastPromise!
    })

    it('should handle multiple rapid executions', async () => {
      const { result } = renderHook(() => useAsyncState<number>())

      let promises: Array<Promise<number | null>>

      // Fire multiple executions rapidly
      act(() => {
        promises = [
          result.current.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return 1
          }),
          result.current.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, 30))
            return 2
          }),
          result.current.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return 3
          }),
        ]
      })

      await waitFor(() => expect(result.current.status).toBe('success'))

      // Should have the data from the last execution
      expect(result.current.data).toBe(3)

      await Promise.all(promises!)
    })
  })

  describe('Manual State Control', () => {
    it('should reset to idle state', async () => {
      const { result } = renderHook(() => useAsyncState<string>())

      // Execute and get success state
      await act(async () => {
        await result.current.execute(async () => 'data')
      })
      expect(result.current.status).toBe('success')

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isIdle).toBe(true)
    })

    it('should reset to initial data when provided', () => {
      const initialData = 'initial'
      const { result } = renderHook(() =>
        useAsyncState<string>({ initialData })
      )

      act(() => {
        result.current.setData('changed')
      })
      expect(result.current.data).toBe('changed')

      act(() => {
        result.current.reset()
      })
      expect(result.current.data).toBe(initialData)
    })

    it('should manually set data and update status', () => {
      const { result } = renderHook(() => useAsyncState<string>())

      act(() => {
        result.current.setData('manual data')
      })

      expect(result.current.data).toBe('manual data')
      expect(result.current.status).toBe('success')
    })

    it('should set status to idle when manually setting null data', () => {
      const { result } = renderHook(() => useAsyncState<string>())

      act(() => {
        result.current.setData('data')
      })
      expect(result.current.status).toBe('success')

      act(() => {
        result.current.setData(null)
      })
      expect(result.current.status).toBe('idle')
    })

    it('should manually set error and update status', () => {
      const { result } = renderHook(() => useAsyncState<string>())
      const error = new Error('Manual error')

      act(() => {
        result.current.setError(error)
      })

      expect(result.current.error).toBe(error)
      expect(result.current.status).toBe('error')
    })

    it('should set status to idle when manually setting null error', () => {
      const { result } = renderHook(() => useAsyncState<string>())

      act(() => {
        result.current.setError(new Error('error'))
      })
      expect(result.current.status).toBe('error')

      act(() => {
        result.current.setError(null)
      })
      expect(result.current.status).toBe('idle')
    })
  })

  describe('Type Safety', () => {
    it('should work with custom data types', async () => {
      interface User {
        id: number
        name: string
      }

      const { result } = renderHook(() => useAsyncState<User>())
      const mockUser: User = { id: 1, name: 'John' }

      await act(async () => {
        await result.current.execute(async () => mockUser)
      })

      expect(result.current.data).toEqual(mockUser)
    })

    it('should work with custom error types', async () => {
      interface CustomError {
        code: string
        message: string
      }

      const { result } = renderHook(() => useAsyncState<string, CustomError>())
      const customError: CustomError = {
        code: 'ERR_001',
        message: 'Custom error',
      }

      await act(async () => {
        try {
          await result.current.execute(async () => {
            throw customError
          })
        } catch {
          // Expected error
        }
      })

      expect(result.current.error).toEqual(customError)
    })
  })

  describe('Derived Boolean States', () => {
    it('should maintain correct derived states throughout lifecycle', async () => {
      const { result } = renderHook(() => useAsyncState<string>())

      // Initial: idle
      expect(result.current.isIdle).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)

      // Execute
      let promise: Promise<string | null>
      act(() => {
        promise = result.current.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'data'
        })
      })

      // Loading
      expect(result.current.isIdle).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isSuccess).toBe(false)
      expect(result.current.isError).toBe(false)

      await act(async () => {
        await promise!
      })

      // Success
      expect(result.current.isIdle).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.isError).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle immediate synchronous resolution', async () => {
      const { result } = renderHook(() => useAsyncState<string>())

      await act(async () => {
        await result.current.execute(async () => 'immediate')
      })

      expect(result.current.data).toBe('immediate')
      expect(result.current.status).toBe('success')
    })

    it('should handle execution with no return value', async () => {
      const { result } = renderHook(() => useAsyncState<void>())

      await act(async () => {
        await result.current.execute(async () => {
          // Side effect only
        })
      })

      expect(result.current.status).toBe('success')
    })

    it('should handle multiple resets', () => {
      const { result } = renderHook(() => useAsyncState<string>())

      act(() => {
        result.current.reset()
        result.current.reset()
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
    })

    it('should maintain referential stability of callbacks', () => {
      const { result, rerender } = renderHook(() => useAsyncState<string>())

      const firstExecute = result.current.execute
      const firstReset = result.current.reset

      rerender()

      expect(result.current.execute).toBe(firstExecute)
      expect(result.current.reset).toBe(firstReset)
    })
  })
})
