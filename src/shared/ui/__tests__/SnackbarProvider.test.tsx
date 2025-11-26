import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { useSnackbar } from 'notistack'
import { SnackbarProvider } from '../SnackbarProvider'

/**
 * Test component that uses the snackbar hook
 * Used to test notification triggering and display
 */
const TestComponent = ({ variant = 'default' }: { variant?: string }) => {
  const { enqueueSnackbar } = useSnackbar()

  return (
    <button
      onClick={() =>
        enqueueSnackbar('Test notification', {
          variant: variant as
            | 'default'
            | 'success'
            | 'error'
            | 'warning'
            | 'info',
        })
      }
    >
      Show Notification
    </button>
  )
}

describe('SnackbarProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <SnackbarProvider>
          <div data-testid="child">Test Child</div>
        </SnackbarProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  describe('Notification Display', () => {
    it('displays notification when triggered', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      // Click button to show notification
      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      // Wait for notification to appear
      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })
    })
  })

  describe('Close Button', () => {
    it('renders close button for notifications', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      // Wait for notification and close button to appear
      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })

      // Check for close button accessibility
      const closeButton = screen.getByRole('button', {
        name: /close notification/i,
      })
      expect(closeButton).toBeInTheDocument()
    })

    it('closes notification when close button is clicked', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      // Show notification
      const showButton = getByRole('button', { name: /show notification/i })
      fireEvent.click(showButton)

      // Wait for notification
      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })

      // Click close button
      const closeButton = getByRole('button', { name: /close notification/i })
      fireEvent.click(closeButton)

      // Notification should be removed
      await waitFor(() => {
        expect(screen.queryByText('Test notification')).not.toBeInTheDocument()
      })
    })
  })

  describe('Configuration', () => {
    it('provides snackbar context and renders children', () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      // Component using snackbar hook should render successfully
      const button = getByRole('button', { name: /show notification/i })
      expect(button).toBeInTheDocument()
    })

    it('prevents duplicate notifications', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })

      // Click multiple times quickly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })

      // Should only show one notification due to preventDuplicate prop
      const notifications = screen.getAllByText('Test notification')
      expect(notifications).toHaveLength(1)
    })
  })

  describe('Multiple Notifications', () => {
    it('can display multiple notifications', async () => {
      const MultiNotificationComponent = () => {
        const { enqueueSnackbar } = useSnackbar()

        return (
          <div>
            <button
              onClick={() => enqueueSnackbar('First notification')}
              data-testid="btn-1"
            >
              Show First
            </button>
            <button
              onClick={() => enqueueSnackbar('Second notification')}
              data-testid="btn-2"
            >
              Show Second
            </button>
          </div>
        )
      }

      const { getByTestId } = render(
        <SnackbarProvider>
          <MultiNotificationComponent />
        </SnackbarProvider>
      )

      // Show first notification
      fireEvent.click(getByTestId('btn-1'))
      await waitFor(() => {
        expect(screen.getByText('First notification')).toBeInTheDocument()
      })

      // Show second notification
      fireEvent.click(getByTestId('btn-2'))
      await waitFor(() => {
        expect(screen.getByText('Second notification')).toBeInTheDocument()
      })

      // Both should be visible
      expect(screen.getByText('First notification')).toBeInTheDocument()
      expect(screen.getByText('Second notification')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible close button with aria-label', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      await waitFor(() => {
        const closeButton = screen.getByRole('button', {
          name: /close notification/i,
        })
        expect(closeButton).toHaveAccessibleName()
      })
    })
  })
})
