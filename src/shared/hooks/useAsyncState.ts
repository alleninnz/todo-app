import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Discriminated union type for async operation status
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * State shape for async operations with discriminated union pattern
 * This enables exhaustive type checking and precise state narrowing
 */
export type AsyncState<T, E = Error> =
  | {
      readonly status: 'idle'
      readonly data: T | null
      readonly error: null
    }
  | {
      readonly status: 'loading'
      readonly data: T | null
      readonly error: null
    }
  | {
      readonly status: 'success'
      readonly data: T
      readonly error: null
    }
  | {
      readonly status: 'error'
      readonly data: T | null
      readonly error: E
    }

/**
 * Options for configuring async state behavior
 */
export interface UseAsyncStateOptions<T, E = Error> {
  /** Initial data value */
  readonly initialData?: T | null
  /** Callback when operation starts */
  readonly onStart?: () => void
  /** Callback when operation succeeds */
  readonly onSuccess?: (data: T) => void
  /** Callback when operation fails */
  readonly onError?: (error: E) => void
  /** Callback when operation completes (success or error) */
  readonly onFinally?: () => void
  /**
   * Whether to reset execution counter on unmount
   * @default true
   */
  readonly resetOnUnmount?: boolean
  /**
   * Whether to throw error after catching it
   * @default false
   */
  readonly throwOnError?: boolean
}

/**
 * Return type for useAsyncState hook
 */
export interface UseAsyncStateReturn<T, E = Error> {
  /** Current status of the async operation */
  readonly status: AsyncStatus
  /** Data returned from successful operation (null unless status is 'success') */
  readonly data: T | null
  /** Error from failed operation (null unless status is 'error') */
  readonly error: E | null

  /** Execute an async function and manage its state */
  readonly execute: (asyncFn: () => Promise<T>) => Promise<T | null>
  /** Reset state to idle */
  readonly reset: () => void
  /** Manually set data */
  readonly setData: (data: T | null) => void
  /** Manually set error */
  readonly setError: (error: E | null) => void

  /** Derived boolean states for convenience */
  readonly isIdle: boolean
  readonly isLoading: boolean
  readonly isSuccess: boolean
  readonly isError: boolean
}

/**
 * Enhanced Async State Hook
 *
 * Manages state for async operations with a discriminated union pattern
 * for type-safe status handling. Prevents race conditions and provides
 * convenient derived states.
 *
 * Features:
 * - Type-safe status management with discriminated unions
 * - Race condition protection via execution counter
 * - Lifecycle callbacks (onStart, onSuccess, onError, onFinally)
 * - Convenient derived boolean states
 * - Manual state control methods
 *
 * @example
 * ```tsx
 * const { data, status, execute, isLoading } = useAsyncState<Task>();
 *
 * const loadTask = async () => {
 *   await execute(() => fetchTask(id));
 * };
 *
 * if (isLoading) return <Spinner />;
 * if (data) return <TaskView task={data} />;
 * ```
 *
 * @example
 * ```tsx
 * // With lifecycle callbacks
 * const { execute } = useAsyncState<Task>({
 *   onSuccess: (task) => showSuccess(`Loaded ${task.title}`),
 *   onError: (error) => showError(error.message),
 * });
 * ```
 */
export const useAsyncState = <T, E = Error>(
  options: UseAsyncStateOptions<T, E> = {}
): UseAsyncStateReturn<T, E> => {
  const [state, setState] = useState<AsyncState<T, E>>({
    status: 'idle' as const,
    data: options.initialData ?? null,
    error: null,
  })

  // Track execution counter to prevent race conditions
  const executionCounterRef = useRef(0)

  // Store callbacks in refs to avoid stale closures
  const onStartRef = useRef(options.onStart)
  const onSuccessRef = useRef(options.onSuccess)
  const onErrorRef = useRef(options.onError)
  const onFinallyRef = useRef(options.onFinally)

  // Update callback refs in effect to avoid render-time mutations
  useEffect(() => {
    onStartRef.current = options.onStart
    onSuccessRef.current = options.onSuccess
    onErrorRef.current = options.onError
    onFinallyRef.current = options.onFinally
  })

  // Cleanup: reset execution counter on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (options.resetOnUnmount !== false) {
        executionCounterRef.current = 0
      }
    }
  }, [options.resetOnUnmount])

  /**
   * Execute an async function and manage its state lifecycle
   */
  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | null> => {
      // Increment counter for this execution
      const currentExecution = ++executionCounterRef.current

      // Set loading state and trigger onStart callback
      setState(prev => ({
        ...prev,
        status: 'loading' as const,
        error: null,
      }))
      onStartRef.current?.()

      try {
        // Execute the async function
        const data = await asyncFn()

        // Only update state if this is still the latest execution
        if (currentExecution === executionCounterRef.current) {
          setState({
            status: 'success' as const,
            data,
            error: null,
          })
          onSuccessRef.current?.(data)
          onFinallyRef.current?.()
          return data
        }

        return null
      } catch (err) {
        // Only update state if this is still the latest execution
        if (currentExecution === executionCounterRef.current) {
          setState(prev => ({
            ...prev,
            status: 'error' as const,
            error: err as E,
          }))
          onErrorRef.current?.(err as E)
          onFinallyRef.current?.()
        }

        if (options.throwOnError) {
          throw err
        }

        return null
      }
    },
    [options.throwOnError]
  )

  /**
   * Reset state to idle with initial data
   */
  const reset = useCallback(() => {
    executionCounterRef.current = 0
    setState({
      status: 'idle' as const,
      data: options.initialData ?? null,
      error: null,
    })
  }, [options.initialData])

  /**
   * Manually set data (useful for optimistic updates)
   * Constructs proper discriminated union variant
   */
  const setData = useCallback((data: T | null) => {
    setState(() => {
      if (data !== null) {
        // Success state: data is non-null
        return {
          status: 'success' as const,
          data,
          error: null,
        }
      } else {
        // Idle state: data is null
        return {
          status: 'idle' as const,
          data: null,
          error: null,
        }
      }
    })
  }, [])

  /**
   * Manually set error
   * Constructs proper discriminated union variant
   */
  const setError = useCallback((error: E | null) => {
    setState(prev => {
      if (error !== null) {
        // Error state: error is non-null
        return {
          status: 'error' as const,
          data: prev.data,
          error,
        }
      } else {
        // Idle state: error is null
        return {
          status: 'idle' as const,
          data: prev.data,
          error: null,
        }
      }
    })
  }, [])

  // Derived convenience booleans
  const isIdle = state.status === 'idle'
  const isLoading = state.status === 'loading'
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    isIdle,
    isLoading,
    isSuccess,
    isError,
  }
}
