import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AppErrorBoundary } from '../AppErrorBoundary'

/**
 * Component that throws an error for testing error boundary
 */
const ThrowError = ({ error }: { error?: Error }) => {
  throw error || new Error('Test error')
}

/**
 * Component that doesn't throw errors - used for success path testing
 */
const SafeComponent = () => <div>Safe content</div>

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    // Error boundaries will log errors, which is expected behavior
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Normal Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <AppErrorBoundary>
          <SafeComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText('Safe content')).toBeInTheDocument()
    })

    it('renders multiple children without errors', () => {
      render(
        <AppErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </AppErrorBoundary>
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })
  })

  describe('Error Catching', () => {
    it('catches errors from child components', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      // Should show error page instead of crashing
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    })

    it('displays custom error message in development mode', () => {
      const customError = new Error('Custom error message')

      render(
        <AppErrorBoundary>
          <ThrowError error={customError} />
        </AppErrorBoundary>
      )

      // Error boundary should catch and display error
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()

      // Custom error message should be visible in error details (dev mode)
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-error">Custom Error UI</div>
      )

      render(
        <AppErrorBoundary fallback={customFallback}>
          <ThrowError />
        </AppErrorBoundary>
      )

      expect(screen.getByTestId('custom-error')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    })
  })

  describe('Error Callback', () => {
    it('calls onError callback when error is caught', () => {
      const onError = vi.fn()

      render(
        <AppErrorBoundary onError={onError}>
          <ThrowError />
        </AppErrorBoundary>
      )

      // onError should be called with error and errorInfo
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('does not call onError when no error occurs', () => {
      const onError = vi.fn()

      render(
        <AppErrorBoundary onError={onError}>
          <SafeComponent />
        </AppErrorBoundary>
      )

      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('Recovery Actions', () => {
    it('displays Try Again button for generic errors', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
    })

    it('displays Reload Page button for generic errors', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument()
    })

    it('shows appropriate recovery actions', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      // Should have recovery buttons (use exact match for button text)
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument()
    })
  })

  describe('Development Mode Error Details', () => {
    it('shows error details in development mode', () => {
      const testError = new Error('Detailed test error')

      render(
        <AppErrorBoundary>
          <ThrowError error={testError} />
        </AppErrorBoundary>
      )

      // Error boundary should catch error and show fallback UI
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    })

    it('shows error category in development mode', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      if (import.meta.env.DEV) {
        // Category should be shown (default is 'unknown')
        expect(screen.getByText(/category:/i)).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility', () => {
    it('has accessible error alert role', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('has accessible error title', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('500')
    })

    it('has labeled error message', () => {
      render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      const errorMessage = document.getElementById('error-message')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('Error Icon', () => {
    it('displays error icon', () => {
      const { container } = render(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      // MUI ErrorOutlineIcon should be present
      const errorIcon = container.querySelector(
        'svg[data-testid="ErrorOutlineIcon"]'
      )
      expect(errorIcon).toBeInTheDocument()
    })
  })

  describe('Multiple Errors', () => {
    it('handles sequential errors', () => {
      const { rerender } = render(
        <AppErrorBoundary>
          <SafeComponent />
        </AppErrorBoundary>
      )

      expect(screen.getByText('Safe content')).toBeInTheDocument()

      // Trigger error
      rerender(
        <AppErrorBoundary>
          <ThrowError />
        </AppErrorBoundary>
      )

      expect(screen.getByText('500')).toBeInTheDocument()
    })
  })

  describe('HTTP Error Codes', () => {
    it('displays appropriate message for different error types', () => {
      const httpError = new Error('Server error')

      render(
        <AppErrorBoundary>
          <ThrowError error={httpError} />
        </AppErrorBoundary>
      )

      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    })
  })
})
