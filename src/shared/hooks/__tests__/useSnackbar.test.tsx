import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { describe, expect, it } from 'vitest'

import { useSnackbar } from '../useSnackbar'

/**
 * Test component that uses the useSnackbar hook
 */
const TestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo, show } = useSnackbar()

  return (
    <div>
      <button onClick={() => showSuccess('Success message')}>
        Show Success
      </button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showWarning('Warning message')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
      <button onClick={() => show('Default message')}>Show Default</button>
    </div>
  )
}

describe('useSnackbar', () => {
  it('exports convenience helper methods', () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    )

    expect(screen.getByText('Show Success')).toBeDefined()
    expect(screen.getByText('Show Error')).toBeDefined()
    expect(screen.getByText('Show Warning')).toBeDefined()
    expect(screen.getByText('Show Info')).toBeDefined()
    expect(screen.getByText('Show Default')).toBeDefined()
  })

  it('displays success notification when showSuccess is called', async () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    )

    const button = screen.getByText('Show Success')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeDefined()
    })
  })

  it('displays error notification when showError is called', async () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>
    )

    const button = screen.getByText('Show Error')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeDefined()
    })
  })
})
