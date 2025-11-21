/**
 * ErrorPage Module - Error Display Components
 *
 * Provides reusable error display components for both router errors (ErrorPage)
 * and component errors (AppErrorBoundary). All business logic is in shared/lib/error.ts.
 */

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { memo, type ErrorInfo } from 'react'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom'
import {
  DEFAULT_ERROR_INFO,
  HTTP_ERROR_MESSAGES,
  type ErrorAction,
  type ErrorPageInfo,
} from '../lib/error'

/**
 * ErrorPageUI component props
 */
interface ErrorPageUIProps {
  /** HTTP status code to display */
  statusCode: number
  /** Error information (title and message) */
  errorInfo: ErrorPageInfo
  /** Optional handler for "Go Back" button */
  onGoBack?: () => void
  /** Optional handler for "Go Home" button */
  onGoHome?: () => void
  /** Optional custom action buttons (overrides onGoBack/onGoHome if provided) */
  customActions?: ErrorAction[]
  /** Optional error object for development details */
  error?: Error | null
  /** Optional React error info with component stack */
  reactErrorInfo?: ErrorInfo | null
}

/**
 * ErrorPage component props
 */
interface ErrorPageProps {
  /** HTTP status code (overrides route error status) */
  statusCode?: number
}

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Shared button styling
 */
const ACTION_BUTTON_STYLES = {
  px: 3,
  py: 1,
  minWidth: 120,
} as const

// ============================================================================
// ERROR PAGE UI COMPONENT (PRESENTATIONAL)
// ============================================================================

/**
 * ErrorPageUI - Pure Presentational Error Display Component
 *
 * Displays user-friendly error messages with optional recovery actions.
 * This is a pure presentational component with no side effects or hooks.
 *
 * **Design Philosophy:**
 * - Pure component (no hooks, no side effects)
 * - Reusable across ErrorPage (router errors) and AppErrorBoundary (component errors)
 * - Consistent error display regardless of error source
 *
 * **Features:**
 * - HTTP status code display (or 'ERR' for network errors)
 * - User-friendly title and message
 * - Error category awareness (client, server, network, auth, unknown)
 * - Optional recovery actions (Go Back, Go Home, or custom actions)
 * - Development-only error details (error message, stack trace, component stack)
 * - Responsive design with breakpoint-based sizing
 * - Accessibility with ARIA attributes
 *
 * **Usage Contexts:**
 * 1. **Router Errors** (via ErrorPage): Uses React Router's error boundary
 * 2. **Component Errors** (via AppErrorBoundary): Uses React's error boundary
 *
 * @example
 * ```tsx
 * // In ErrorPage (with router navigation)
 * <ErrorPageUI
 *   statusCode={404}
 *   errorInfo={{ title: 'Page Not Found', message: '...', category: 'client' }}
 *   onGoBack={() => navigate(-1)}
 *   onGoHome={() => navigate('/')}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // In AppErrorBoundary (with custom actions)
 * <ErrorPageUI
 *   statusCode={500}
 *   errorInfo={{ title: 'Something Went Wrong', message: '...', category: 'unknown' }}
 *   error={error}
 *   reactErrorInfo={errorInfo}
 *   customActions={[
 *     { label: 'Try Again', onClick: handleReset, variant: 'outlined' },
 *     { label: 'Reload Page', onClick: handleReload, variant: 'contained' },
 *   ]}
 * />
 * ```
 */
const ErrorPageUIComponent = ({
  statusCode,
  errorInfo,
  onGoBack,
  onGoHome,
  customActions,
  error,
  reactErrorInfo,
}: ErrorPageUIProps) => {
  // Determine which actions to show: custom actions override default navigation
  const hasActions = customActions
    ? customActions.length > 0
    : onGoBack || onGoHome

  // Display 'ERR' for network errors (statusCode 0), otherwise show the code
  const displayCode = statusCode === 0 ? 'ERR' : statusCode

  return (
    <Container
      component="main"
      role="alert"
      aria-labelledby="error-title"
      aria-describedby="error-message"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
        {/* Error Icon */}
        <ErrorOutlineIcon
          sx={{
            fontSize: { xs: 80, md: 120 },
            color: 'error.main',
          }}
          aria-hidden="true"
        />

        {/* Status Code or ERR */}
        <Typography
          id="error-title"
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '5rem' },
            fontWeight: 'bold',
            color: 'text.primary',
            lineHeight: 1,
          }}
        >
          {displayCode}
        </Typography>

        {/* Error Title */}
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {errorInfo.title}
        </Typography>

        {/* Error Message */}
        <Typography
          id="error-message"
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            color: 'text.secondary',
            maxWidth: 600,
            px: 2,
            mb: 2,
          }}
        >
          {errorInfo.message}
        </Typography>

        {/* Action Buttons - Show custom actions or default navigation */}
        {hasActions && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="center"
          >
            {customActions ? (
              // Render custom action buttons
              customActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outlined'}
                  onClick={action.onClick}
                  sx={ACTION_BUTTON_STYLES}
                >
                  {action.label}
                </Button>
              ))
            ) : (
              // Render default navigation buttons
              <>
                {onGoBack && (
                  <Button
                    variant="outlined"
                    onClick={onGoBack}
                    sx={ACTION_BUTTON_STYLES}
                  >
                    Go Back
                  </Button>
                )}
                {onGoHome && (
                  <Button
                    variant="contained"
                    onClick={onGoHome}
                    sx={ACTION_BUTTON_STYLES}
                  >
                    Go Home
                  </Button>
                )}
              </>
            )}
          </Stack>
        )}

        {/* Development Error Details */}
        {import.meta.env.DEV && error && (
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              maxWidth: 800,
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'error.main',
                fontWeight: 600,
                mb: 1,
              }}
            >
              Development Error Details:
            </Typography>

            {/* Error Category */}
            {errorInfo.category && (
              <Typography
                variant="caption"
                component="div"
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.secondary',
                  mb: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                Category: {errorInfo.category}
              </Typography>
            )}

            {/* Error Message */}
            <Typography
              variant="caption"
              component="div"
              sx={{
                fontFamily: 'monospace',
                color: 'text.secondary',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                mb: 1,
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              {error.message}
            </Typography>

            {/* Stack Trace */}
            {error.stack && (
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  color: 'text.secondary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.7rem',
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: 'auto',
                  mb: reactErrorInfo?.componentStack ? 2 : 0,
                }}
              >
                {error.stack}
              </Typography>
            )}

            {/* Component Stack (from React Error Boundary) */}
            {reactErrorInfo?.componentStack && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Component Stack:
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {reactErrorInfo.componentStack}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Stack>
    </Container>
  )
}

// Memoize ErrorPageUI - error pages rarely change props
ErrorPageUIComponent.displayName = 'ErrorPageUI'
export const ErrorPageUI = memo(ErrorPageUIComponent)

// ============================================================================
// ERROR PAGE COMPONENT (ROUTER ERROR BOUNDARY)
// ============================================================================

/**
 * ErrorPage - User-Friendly Error Display Component for Router Errors
 *
 * Displays contextual error messages based on HTTP status codes or route errors.
 * Provides recovery actions (go back, go home) and development error details.
 *
 * **Features:**
 * - HTTP status code mapping to user-friendly messages
 * - React Router error integration (useRouteError)
 * - Network error detection
 * - Development-only error stack traces
 * - Responsive design with breakpoint-based sizing
 * - Accessibility with ARIA attributes
 * - Pure MUI styling (no Tailwind)
 *
 * **Error Sources:**
 * 1. Route errors (from React Router error boundary)
 * 2. Prop-based status code (programmatic errors)
 * 3. Default fallback for unknown errors
 *
 * **Supported Status Codes:**
 * - 400: Bad Request
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Not Found
 * - 500: Internal Server Error
 * - 502: Bad Gateway
 * - 503: Service Unavailable
 * - 504: Gateway Timeout
 *
 * **Development Features:**
 * - Error message display
 * - Stack trace display (if available)
 * - Error category display (client, server, network, auth, unknown)
 *
 * @example
 * ```tsx
 * // In route configuration
 * <Route path="*" element={<ErrorPage statusCode={404} />} />
 * ```
 *
 * @example
 * ```tsx
 * // As error boundary fallback
 * <Route
 *   path="/"
 *   errorElement={<ErrorPage />}
 *   element={<App />}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Programmatic error display
 * if (notFound) {
 *   return <ErrorPage statusCode={404} />
 * }
 * ```
 */
const ErrorPageComponent = ({ statusCode: propStatusCode }: ErrorPageProps) => {
  const routeError = useRouteError()
  const navigate = useNavigate()

  // Determine status code: props → route error → default 500
  const statusCode =
    propStatusCode ||
    (isRouteErrorResponse(routeError) ? routeError.status : 500)

  // Get error info for status code with fallback
  const errorInfo = HTTP_ERROR_MESSAGES[statusCode] || DEFAULT_ERROR_INFO

  // Extract error object for development details
  const error = routeError instanceof Error ? routeError : null

  /**
   * Navigate back to previous page
   */
  const handleGoBack = (): void => {
    navigate(-1)
  }

  /**
   * Navigate to home page
   */
  const handleGoHome = (): void => {
    navigate('/')
  }

  return (
    <ErrorPageUI
      statusCode={statusCode}
      errorInfo={errorInfo}
      onGoBack={handleGoBack}
      onGoHome={handleGoHome}
      error={error}
    />
  )
}

// Memoize ErrorPage - error pages rarely change props
ErrorPageComponent.displayName = 'ErrorPage'
export const ErrorPage = memo(ErrorPageComponent)

// Re-export types for convenience
export type { ErrorAction, ErrorPageInfo }
