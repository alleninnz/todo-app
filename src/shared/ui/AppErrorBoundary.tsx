import { Component, type ErrorInfo, type ReactNode } from 'react'
import { getErrorInfo, type ErrorAction } from '@shared/lib/error'
import { ErrorPageUI } from './ErrorPage'

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
 * Error boundary state
 */
interface AppErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean
  /** The caught error object */
  error: Error | null
  /** React error info with component stack */
  errorInfo: ErrorInfo | null
}

/**
 * AppErrorBoundary - React Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays fallback UI.
 * Prevents entire app crash when a component throws an error.
 *
 * **Error Boundary Lifecycle:**
 * 1. Child component throws error
 * 2. `getDerivedStateFromError()` updates state
 * 3. `componentDidCatch()` logs error details
 * 4. Fallback UI renders instead of crashed component tree
 *
 * **What Error Boundaries Catch:**
 * - Errors during rendering
 * - Errors in lifecycle methods
 * - Errors in constructors of child components
 *
 * **What Error Boundaries DON'T Catch:**
 * - Event handlers (use try-catch)
 * - Async code (setTimeout, promises)
 * - Server-side rendering errors
 * - Errors in the error boundary itself
 *
 * **Best Practices:**
 * - Place at strategic levels (app root, route boundaries, feature boundaries)
 * - Log errors to monitoring service (Sentry, LogRocket, etc.)
 * - Provide helpful fallback UI with recovery actions
 * - Consider granularity (app-level vs component-level boundaries)
 *
 * @example
 * ```tsx
 * // Wrap entire app
 * <AppErrorBoundary>
 *   <App />
 * </AppErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // With error logging
 * <AppErrorBoundary onError={(error, info) => {
 *   logErrorToService(error, info.componentStack)
 * }}>
 *   <TasksPage />
 * </AppErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Custom fallback UI
 * <AppErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </AppErrorBoundary>
 * ```
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * Update state when error is caught
   * This lifecycle method is called during the render phase
   *
   * @param error - The error that was thrown
   * @returns New state object
   */
  static getDerivedStateFromError(
    error: Error
  ): Partial<AppErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Log error details after component tree has been rendered
   * This lifecycle method is called during the commit phase
   *
   * @param error - The error that was thrown
   * @param errorInfo - React error info with component stack trace
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary] Caught error:', error)
      console.error(
        '[AppErrorBoundary] Component stack:',
        errorInfo.componentStack
      )
    }

    // Store error info in state for display
    this.setState({ errorInfo })

    // Call optional error callback (for external logging services)
    this.props.onError?.(error, errorInfo)
  }

  /**
   * Reset error boundary state to retry rendering
   * Useful for recovery actions
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * Reload the page (last resort recovery)
   */
  handleReload = (): void => {
    window.location.reload()
  }

  /**
   * Navigate to home page
   */
  handleGoHome = (): void => {
    window.location.href = '/'
  }

  /**
   * Get context-aware recovery actions based on error category
   *
   * Provides smart recovery options that match the error type:
   * - Network errors: Retry + Reload
   * - Auth errors: Try Again + Go Home (to re-authenticate)
   * - Client/Server/Unknown errors: Try Again + Reload
   *
   * @param category - Error category from errorInfo
   * @returns Array of error actions appropriate for the error type
   */
  getRecoveryActions = (
    category?: 'client' | 'server' | 'network' | 'auth' | 'unknown'
  ): ErrorAction[] => {
    switch (category) {
      case 'network':
        // Network errors: User might want to retry connection or reload
        return [
          {
            label: 'Retry',
            onClick: this.handleReset,
            variant: 'outlined',
          },
          {
            label: 'Reload Page',
            onClick: this.handleReload,
            variant: 'contained',
          },
        ]

      case 'auth':
        // Auth errors: User needs to re-authenticate or return home
        return [
          {
            label: 'Try Again',
            onClick: this.handleReset,
            variant: 'outlined',
          },
          {
            label: 'Go Home',
            onClick: this.handleGoHome,
            variant: 'contained',
          },
        ]

      case 'client':
      case 'server':
      case 'unknown':
      default:
        // Generic errors: Standard recovery options
        return [
          {
            label: 'Try Again',
            onClick: this.handleReset,
            variant: 'outlined',
          },
          {
            label: 'Reload Page',
            onClick: this.handleReload,
            variant: 'contained',
          },
        ]
    }
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    // No error - render children normally
    if (!hasError) {
      return children
    }

    // Custom fallback provided - use it
    if (fallback) {
      return fallback
    }

    // Extract HTTP status code and error info from error
    const { statusCode, errorInfo: errorPageInfo } = getErrorInfo(error)

    // Log error category in development for debugging (skip during tests)
    if (
      import.meta.env.DEV &&
      import.meta.env.MODE !== 'test' &&
      errorPageInfo.category
    ) {
      console.info(
        `[AppErrorBoundary] Error category: ${errorPageInfo.category}`
      )
    }

    // Get context-aware recovery actions based on error category
    const recoveryActions = this.getRecoveryActions(errorPageInfo.category)

    // Render ErrorPageUI with extracted information and smart recovery actions
    return (
      <ErrorPageUI
        statusCode={statusCode}
        errorInfo={errorPageInfo}
        error={error}
        reactErrorInfo={errorInfo}
        customActions={recoveryActions}
      />
    )
  }
}
