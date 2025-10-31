import { theme } from '@/shared/config/theme'
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary'
import { SnackbarProvider } from '@/shared/ui/SnackbarProvider'
import { ThemeProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

export function AppProviders() {
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
