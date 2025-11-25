import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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

    it('displays success variant notification', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent variant="success" />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })
    })

    it('displays error variant notification', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent variant="error" />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })
    })

    it('displays warning variant notification', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent variant="warning" />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Test notification')).toBeInTheDocument()
      })
    })

    it('displays info variant notification', async () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent variant="info" />
        </SnackbarProvider>
      )

      const button = getByRole('button', { name: /show notification/i })
      fireEvent.click(button)

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
    it('renders SnackbarProvider without errors', () => {
      const { container } = render(
        <SnackbarProvider>
          <div>Test</div>
        </SnackbarProvider>
      )

      // Provider should wrap children successfully
      expect(container).toBeInTheDocument()
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('provides snackbar context to children', () => {
      const { getByRole } = render(
        <SnackbarProvider>
          <TestComponent />
        </SnackbarProvider>
      )

      // Component using snackbar hook should render successfully
      const button = getByRole('button', { name: /show notification/i })
      expect(button).toBeInTheDocument()
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
