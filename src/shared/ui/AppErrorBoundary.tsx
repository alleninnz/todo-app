import { type ReactNode, type ErrorInfo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AppErrorFallback } from './AppErrorFallback'

/**
 * Props for AppErrorBoundary component
 */
interface AppErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode
  /** Optional custom fallback UI */
  fallback?: ReactNode
  /** Callback fired when error is caught (for logging/monitoring) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * AppErrorBoundary - React Error Boundary Component
 *
 * Uses `react-error-boundary` to catch errors in the component tree.
 * Prevents entire app crash when a component throws an error.
 *
 * **Features:**
 * - Catches errors in render phase
 * - Catches errors in event handlers (via useErrorBoundary hook in children)
 * - Catches errors in async code (via useErrorBoundary hook in children)
 * - Provides recovery mechanisms (reset, reload)
 *
 * @example
 * ```tsx
 * <AppErrorBoundary>
 *   <App />
 * </AppErrorBoundary>
 * ```
 */
export const AppErrorBoundary = ({
  children,
  fallback,
  onError,
}: AppErrorBoundaryProps) => {
  const handleError = (error: Error, info: ErrorInfo) => {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary] Caught error:', error)
      console.error('[AppErrorBoundary] Component stack:', info.componentStack)
    }

    // Call optional error callback
    onError?.(error, info)
  }

  return (
    <ErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : AppErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
