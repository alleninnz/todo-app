import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { IconButton } from '@mui/material'
import {
  SnackbarProvider as NotistackProvider,
  closeSnackbar,
  type SnackbarKey,
} from 'notistack'
import type { ReactNode } from 'react'

interface SnackbarProviderProps {
  children: ReactNode
}

/**
 * Global Snackbar Provider
 *
 * Provides centralized notification management for the Todo App.
 * Inherits MUI theme when placed inside ThemeProvider.
 *
 * Features:
 * - Displays feedback for task operations (create, update, delete, complete)
 * - Prevents duplicate messages from showing simultaneously
 * - Auto-dismisses after timeout with manual close option
 * - Positioned at bottom-left for better mobile UX (doesn't block app header)
 * - Supports all notification variants (success, error, warning, info)
 *
 * Usage:
 * ```tsx
 * const { enqueueSnackbar } = useSnackbar();
 * enqueueSnackbar('Task created successfully', { variant: 'success' });
 * ```
 */
export function SnackbarProvider({ children }: SnackbarProviderProps) {
  return (
    <NotistackProvider
      // Max number of snackbars displayed simultaneously
      maxSnack={3}
      // Auto-hide duration (4 seconds gives users time to read task feedback)
      autoHideDuration={4000}
      // Prevent duplicate messages (useful for preventing multiple API error notifications)
      preventDuplicate
      // Compact style for better space efficiency
      dense
      // Bottom-left positioning - doesn't interfere with task list or app header
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      // Show variant-specific icons (checkmark, error, info, warning)
      hideIconVariant={false}
      // Default variant for neutral messages
      variant="default"
      // Custom close button for each notification
      action={(key: SnackbarKey) => (
        <IconButton
          onClick={() => closeSnackbar(key)}
          size="small"
          aria-label="Close notification"
          sx={{
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      )}
    >
      {children}
    </NotistackProvider>
  )
}
