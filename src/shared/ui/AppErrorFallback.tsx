import { getErrorInfo, type ErrorAction } from '@shared/lib/error'
import { type FallbackProps } from 'react-error-boundary'
import { ErrorPageUI } from './ErrorPage'

/**
 * AppErrorFallback - Fallback UI for AppErrorBoundary
 *
 * Displays error information and provides context-aware recovery actions.
 * Used as the `FallbackComponent` for `react-error-boundary`.
 */
export const AppErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  // Extract HTTP status code and error info
  const { statusCode, errorInfo: errorPageInfo } = getErrorInfo(error)

  // Log error category in development
  if (
    import.meta.env.DEV &&
    import.meta.env.MODE !== 'test' &&
    errorPageInfo.category
  ) {
    console.info(`[AppErrorBoundary] Error category: ${errorPageInfo.category}`)
  }

  /**
   * Reload the page (last resort recovery)
   */
  const handleReload = (): void => {
    window.location.reload()
  }

  /**
   * Navigate to home page
   */
  const handleGoHome = (): void => {
    window.location.assign('/')
  }

  /**
   * Get context-aware recovery actions based on error category
   */
  const getRecoveryActions = (
    category?: 'client' | 'server' | 'network' | 'auth' | 'unknown'
  ): ErrorAction[] => {
    switch (category) {
      case 'network':
        return [
          {
            label: 'Retry',
            onClick: resetErrorBoundary,
            variant: 'outlined',
          },
          {
            label: 'Reload Page',
            onClick: handleReload,
            variant: 'contained',
          },
        ]

      case 'auth':
        return [
          {
            label: 'Try Again',
            onClick: resetErrorBoundary,
            variant: 'outlined',
          },
          {
            label: 'Go Home',
            onClick: handleGoHome,
            variant: 'contained',
          },
        ]

      case 'client':
      case 'server':
      case 'unknown':
      default:
        return [
          {
            label: 'Try Again',
            onClick: resetErrorBoundary,
            variant: 'outlined',
          },
          {
            label: 'Reload Page',
            onClick: handleReload,
            variant: 'contained',
          },
        ]
    }
  }

  return (
    <ErrorPageUI
      statusCode={statusCode}
      errorInfo={errorPageInfo}
      error={error}
      // We don't have componentStack from react-error-boundary in the same way,
      // but it might be in error.stack. The library passes resetErrorBoundary.
      customActions={getRecoveryActions(errorPageInfo.category)}
    />
  )
}
