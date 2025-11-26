import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as Notistack from 'notistack'
import { SnackbarProvider } from '../SnackbarProvider'

// Mock the env config
vi.mock('../../config/env', () => ({
  env: {
    VITE_SNACKBAR_MAX_COUNT: 5,
    VITE_SNACKBAR_AUTO_HIDE: 2500,
  },
}))

// Mock notistack
vi.mock('notistack', () => ({
  SnackbarProvider: vi.fn(({ children }) => <div>{children}</div>),
  closeSnackbar: vi.fn(),
}))

describe('SnackbarProvider Configuration', () => {
  it('passes correct configuration to NotistackProvider', () => {
    render(
      <SnackbarProvider>
        <div>Test</div>
      </SnackbarProvider>
    )

    expect(
      vi.mocked(Notistack.SnackbarProvider).mock.calls[0][0]
    ).toMatchObject({
      maxSnack: 5,
      autoHideDuration: 2500,
      preventDuplicate: true,
      dense: true,
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    })
  })
})
