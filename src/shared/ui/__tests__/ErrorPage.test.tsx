import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import * as ReactRouterDom from 'react-router-dom'
import { ErrorPage, ErrorPageUI, type ErrorPageInfo } from '../ErrorPage'

// Mock React Router DOM hooks
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof ReactRouterDom>('react-router-dom')
  return {
    ...actual,
    useRouteError: vi.fn(),
    useNavigate: vi.fn(),
  }
})

describe('ErrorPageUI', () => {
  const mockOnGoBack = vi.fn()
  const mockOnGoHome = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Status Code Display', () => {
    it('displays 404 status code with Page Not Found message', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Page Not Found',
        message: "The page you're looking for doesn't exist or has been moved.",
        category: 'client',
      }

      render(
        <ErrorPageUI
          statusCode={404}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
          onGoHome={mockOnGoHome}
        />
      )

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(
        screen.getByText(
          "The page you're looking for doesn't exist or has been moved."
        )
      ).toBeInTheDocument()
    })

    it('displays 500 status code with Internal Server Error message', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Internal Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        category: 'server',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
        />
      )

      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Something went wrong on our end. Please try again later.'
        )
      ).toBeInTheDocument()
    })

    it('displays 401 status code with Unauthorized message', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Unauthorized',
        message: 'You need to be logged in to access this resource.',
        category: 'auth',
      }

      render(<ErrorPageUI statusCode={401} errorInfo={errorInfo} />)

      expect(screen.getByText('401')).toBeInTheDocument()
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    })

    it('displays 403 status code with Forbidden message', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Access Forbidden',
        message: "You don't have permission to access this resource.",
        category: 'auth',
      }

      render(<ErrorPageUI statusCode={403} errorInfo={errorInfo} />)

      expect(screen.getByText('403')).toBeInTheDocument()
      expect(screen.getByText('Access Forbidden')).toBeInTheDocument()
    })

    it('displays ERR for network errors (status code 0)', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Network Error',
        message: 'Unable to connect to the server.',
        category: 'network',
      }

      render(<ErrorPageUI statusCode={0} errorInfo={errorInfo} />)

      expect(screen.getByText('ERR')).toBeInTheDocument()
      expect(screen.getByText('Network Error')).toBeInTheDocument()
    })

    it('displays unknown status code when not in standard mapping', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Unknown Error',
        message: 'An unexpected error occurred.',
        category: 'unknown',
      }

      render(<ErrorPageUI statusCode={418} errorInfo={errorInfo} />)

      expect(screen.getByText('418')).toBeInTheDocument()
      expect(screen.getByText('Unknown Error')).toBeInTheDocument()
    })
  })

  describe('HTTP Status Messages', () => {
    const testCases: Array<{
      code: number
      errorInfo: ErrorPageInfo
    }> = [
      {
        code: 400,
        errorInfo: {
          title: 'Bad Request',
          message:
            'The request could not be understood. Please check your input and try again.',
          category: 'client',
        },
      },
      {
        code: 502,
        errorInfo: {
          title: 'Bad Gateway',
          message: 'Unable to connect to the server. Please try again later.',
          category: 'network',
        },
      },
      {
        code: 503,
        errorInfo: {
          title: 'Service Unavailable',
          message:
            'The service is temporarily unavailable. Please try again later.',
          category: 'server',
        },
      },
      {
        code: 504,
        errorInfo: {
          title: 'Gateway Timeout',
          message:
            'The server did not respond in time. Please try again later.',
          category: 'server',
        },
      },
    ]

    testCases.forEach(({ code, errorInfo }) => {
      it(`displays ${code} status with correct title`, () => {
        render(<ErrorPageUI statusCode={code} errorInfo={errorInfo} />)

        expect(screen.getByText(code.toString())).toBeInTheDocument()
        expect(screen.getByText(errorInfo.title)).toBeInTheDocument()
      })
    })
  })

  describe('Default Navigation Actions', () => {
    it('renders Go Back button when onGoBack provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
        />
      )

      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument()
    })

    it('renders Go Home button when onGoHome provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoHome={mockOnGoHome}
        />
      )

      expect(
        screen.getByRole('button', { name: /go home/i })
      ).toBeInTheDocument()
    })

    it('renders both buttons when both handlers provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
          onGoHome={mockOnGoHome}
        />
      )

      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go home/i })
      ).toBeInTheDocument()
    })

    it('calls onGoBack when Go Back is clicked', async () => {
      const user = userEvent.setup()
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={404}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
        />
      )

      const goBackButton = screen.getByRole('button', { name: /go back/i })
      await user.click(goBackButton)

      expect(mockOnGoBack).toHaveBeenCalledTimes(1)
    })

    it('calls onGoHome when Go Home is clicked', async () => {
      const user = userEvent.setup()
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoHome={mockOnGoHome}
        />
      )

      const goHomeButton = screen.getByRole('button', { name: /go home/i })
      await user.click(goHomeButton)

      expect(mockOnGoHome).toHaveBeenCalledTimes(1)
    })

    it('does not render buttons when no handlers provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(<ErrorPageUI statusCode={500} errorInfo={errorInfo} />)

      expect(
        screen.queryByRole('button', { name: /go back/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /go home/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Custom Actions', () => {
    it('renders custom actions when provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }
      const customActions = [
        { label: 'Custom Action 1', onClick: vi.fn() },
        { label: 'Custom Action 2', onClick: vi.fn() },
      ]

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          customActions={customActions}
        />
      )

      expect(screen.getByText('Custom Action 1')).toBeInTheDocument()
      expect(screen.getByText('Custom Action 2')).toBeInTheDocument()
    })

    it('does not render default actions when custom actions provided', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }
      const customActions = [{ label: 'Custom Action', onClick: vi.fn() }]

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
          onGoHome={mockOnGoHome}
          customActions={customActions}
        />
      )

      expect(
        screen.queryByRole('button', { name: /go back/i })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /go home/i })
      ).not.toBeInTheDocument()
      expect(screen.getByText('Custom Action')).toBeInTheDocument()
    })

    it('handles custom action clicks', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }
      const customActions = [{ label: 'Custom', onClick: handleClick }]

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          customActions={customActions}
        />
      )

      const customButton = screen.getByRole('button', { name: /custom/i })
      await user.click(customButton)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies correct variant to custom actions', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }
      const customActions = [
        { label: 'Outlined', onClick: vi.fn(), variant: 'outlined' as const },
        { label: 'Contained', onClick: vi.fn(), variant: 'contained' as const },
      ]

      const { container } = render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          customActions={customActions}
        />
      )

      // Check button variants by class
      const outlinedButton = container.querySelector('.MuiButton-outlined')
      const containedButton = container.querySelector('.MuiButton-contained')

      expect(outlinedButton).toBeInTheDocument()
      expect(containedButton).toBeInTheDocument()
    })
  })

  describe('Development Error Details', () => {
    beforeEach(() => {
      // Save original NODE_ENV
      process.env.NODE_ENV_ORIGINAL = process.env.NODE_ENV
    })

    afterEach(() => {
      // Restore original NODE_ENV
      if (process.env.NODE_ENV_ORIGINAL) {
        process.env.NODE_ENV = process.env.NODE_ENV_ORIGINAL
        delete process.env.NODE_ENV_ORIGINAL
      }
    })

    it('shows error details in development mode', () => {
      process.env.NODE_ENV = 'development'

      const testError = new Error('Detailed error message')
      testError.stack = 'Error stack trace'

      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
        category: 'server',
      }

      render(
        <ErrorPageUI statusCode={500} errorInfo={errorInfo} error={testError} />
      )

      if (import.meta.env.DEV) {
        expect(screen.getByText('Detailed error message')).toBeInTheDocument()
      }
    })

    it('shows error category in development mode', () => {
      process.env.NODE_ENV = 'development'

      const testError = new Error('Test error')

      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
        category: 'server',
      }

      render(
        <ErrorPageUI statusCode={500} errorInfo={errorInfo} error={testError} />
      )

      if (import.meta.env.DEV) {
        expect(screen.getByText(/category:/i)).toBeInTheDocument()
      }
    })

    it('shows error stack trace in development mode', () => {
      process.env.NODE_ENV = 'development'

      const testError = new Error('Test error')
      testError.stack = 'Error: Test error\n  at Object.<anonymous>'

      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI statusCode={500} errorInfo={errorInfo} error={testError} />
      )

      if (import.meta.env.DEV && testError.stack) {
        expect(screen.getByText(/Object\.<anonymous>/)).toBeInTheDocument()
      }
    })

    it('shows error details only in development mode', () => {
      const testError = new Error('Development error details')
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI statusCode={500} errorInfo={errorInfo} error={testError} />
      )

      // Error details are shown in dev mode (where tests run)
      if (import.meta.env.DEV) {
        expect(
          screen.getByText('Development error details')
        ).toBeInTheDocument()
      }
    })
  })

  describe('Error Icon', () => {
    it('renders error icon', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      const { container } = render(
        <ErrorPageUI statusCode={500} errorInfo={errorInfo} />
      )

      const errorIcon = container.querySelector(
        'svg[data-testid="ErrorOutlineIcon"]'
      )
      expect(errorIcon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible alert role', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(<ErrorPageUI statusCode={404} errorInfo={errorInfo} />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('has accessible heading for status code', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Page Not Found',
        message: 'Resource not found.',
      }

      render(<ErrorPageUI statusCode={404} errorInfo={errorInfo} />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('404')
    })

    it('has labeled error message', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(<ErrorPageUI statusCode={500} errorInfo={errorInfo} />)

      const errorMessage = document.getElementById('error-message')
      expect(errorMessage).toBeInTheDocument()
    })

    it('action buttons have accessible labels', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Error',
        message: 'An error occurred',
      }

      render(
        <ErrorPageUI
          statusCode={500}
          errorInfo={errorInfo}
          onGoBack={mockOnGoBack}
          onGoHome={mockOnGoHome}
        />
      )

      const goBackButton = screen.getByRole('button', { name: /go back/i })
      const goHomeButton = screen.getByRole('button', { name: /go home/i })

      expect(goBackButton).toHaveAccessibleName()
      expect(goHomeButton).toHaveAccessibleName()
    })
  })

  describe('Responsive Design', () => {
    it('renders error content responsively', () => {
      const errorInfo: ErrorPageInfo = {
        title: 'Page Not Found',
        message: 'Resource not found.',
      }

      render(<ErrorPageUI statusCode={404} errorInfo={errorInfo} />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })
})

describe('ErrorPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Provide default mock implementations
    vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(undefined)
    vi.mocked(ReactRouterDom.useNavigate).mockReturnValue(vi.fn())
  })

  describe('Direct Props', () => {
    it('shows 404 error when statusCode prop is 404', () => {
      render(<ErrorPage statusCode={404} />)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('shows 500 error when statusCode prop is 500', () => {
      render(<ErrorPage statusCode={500} />)

      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
    })

    it('defaults to 500 when no status code provided', () => {
      render(<ErrorPage />)

      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
    })
  })

  describe('React Router Integration', () => {
    it('extracts status code from router error with status property', () => {
      const routerError = {
        status: 404,
        statusText: 'Not Found',
        data: {},
        internal: false,
      }
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(routerError)

      render(<ErrorPage />)

      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('extracts status code from isRouteErrorResponse', () => {
      const routerError = {
        status: 403,
        statusText: 'Forbidden',
        data: {},
        internal: false,
      }
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(routerError)

      render(<ErrorPage />)

      expect(screen.getByText('403')).toBeInTheDocument()
      expect(screen.getByText('Access Forbidden')).toBeInTheDocument()
    })

    it('handles router error with unknown status', () => {
      const routerError = {
        message: 'Unknown error',
      }
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(routerError)

      render(<ErrorPage />)

      // Should default to 500 for unknown errors
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('extracts error from Error instance', () => {
      const routerError = new Error('Router error occurred')
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(routerError)

      render(<ErrorPage />)

      // Should show error page
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Navigation Actions', () => {
    it('renders default navigation buttons', () => {
      render(<ErrorPage statusCode={500} />)

      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go home/i })
      ).toBeInTheDocument()
    })

    it('uses navigate hook for Go Back button', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.mocked(ReactRouterDom.useNavigate).mockReturnValue(navigateMock)

      render(<ErrorPage statusCode={404} />)

      const goBackButton = screen.getByRole('button', { name: /go back/i })
      await user.click(goBackButton)

      expect(navigateMock).toHaveBeenCalledWith(-1)
    })

    it('uses navigate hook for Go Home button', async () => {
      const user = userEvent.setup()
      const navigateMock = vi.fn()
      vi.mocked(ReactRouterDom.useNavigate).mockReturnValue(navigateMock)

      render(<ErrorPage statusCode={404} />)

      const goHomeButton = screen.getByRole('button', { name: /go home/i })
      await user.click(goHomeButton)

      expect(navigateMock).toHaveBeenCalledWith('/')
    })
  })

  describe('HTTP Error Message Mapping', () => {
    const errorMessages = [
      { code: 400, title: 'Bad Request' },
      { code: 401, title: 'Unauthorized' },
      { code: 403, title: 'Access Forbidden' },
      { code: 404, title: 'Page Not Found' },
      { code: 500, title: 'Internal Server Error' },
      { code: 502, title: 'Bad Gateway' },
      { code: 503, title: 'Service Unavailable' },
      { code: 504, title: 'Gateway Timeout' },
    ]

    errorMessages.forEach(({ code, title }) => {
      it(`displays correct message for ${code} status code`, () => {
        render(<ErrorPage statusCode={code} />)

        expect(screen.getByText(code.toString())).toBeInTheDocument()
        expect(screen.getByText(title)).toBeInTheDocument()
      })
    })

    it('shows generic message for unmapped status code', () => {
      render(<ErrorPage statusCode={418} />)

      expect(screen.getByText('418')).toBeInTheDocument()
      expect(screen.getByText('An Error Occurred')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined router error gracefully', () => {
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(undefined)

      render(<ErrorPage />)

      // Should default to 500
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('handles null router error gracefully', () => {
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(null)

      render(<ErrorPage />)

      // Should default to 500
      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('handles error without status code', () => {
      const error = new Error('Generic error')
      vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(error)

      render(<ErrorPage />)

      // Should default to 500
      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('renders with MUI components', () => {
      const { container } = render(<ErrorPage statusCode={404} />)

      // Should have MUI Container
      expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument()
    })

    it('uses theme spacing and colors', () => {
      render(<ErrorPage statusCode={500} />)

      // Error page should render with theme
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
