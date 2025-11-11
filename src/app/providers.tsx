import { env } from '@/shared/config/env'
import { theme } from '@/shared/config/theme'
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary'
import { SnackbarProvider } from '@/shared/ui/SnackbarProvider'
import { ThemeProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

// Initialize MSW in development mode when feature flag is enabled
if (env.VITE_ENABLE_MSW && env.VITE_ENV === 'development') {
  const { worker } = await import('@/test/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'warn', // Log unhandled API requests to console
  })
}

export const AppProviders = () => {
  return (
    <AppErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
