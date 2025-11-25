import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { IconButton } from '@mui/material'
import {
  SnackbarProvider as NotistackProvider,
  closeSnackbar,
  type SnackbarKey,
} from 'notistack'
import { memo, type ReactNode } from 'react'

import { env } from '../config/env'

/**
 * Props for SnackbarProvider
 */
interface SnackbarProviderProps {
  /** Child components to wrap */
  children: ReactNode
}

/**
 * Close button component for snackbar notifications
 * Memoized to prevent unnecessary re-renders
 *
 * @param snackbarKey - Unique identifier for the snackbar to close
 */
const CloseButton = memo(({ snackbarKey }: { snackbarKey: SnackbarKey }) => (
  <IconButton
    onClick={() => closeSnackbar(snackbarKey)}
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
))

CloseButton.displayName = 'SnackbarCloseButton'

/**
 * SnackbarProvider - Global Notification System
 *
 * Provides centralized notification management for the Todo App using Notistack.
 * Inherits MUI theme when placed inside ThemeProvider.
 *
 * **Features:**
 * - Displays feedback for task operations (create, update, delete, complete)
 * - Prevents duplicate messages from showing simultaneously
 * - Auto-dismisses after timeout with manual close option
 * - Positioned at bottom-left for better mobile UX (doesn't block app header)
 * - Supports all notification variants (success, error, warning, info, default)
 * - Theme-integrated styling with MUI
 *
 * **Configuration:**
 * - Max simultaneous snackbars: 3
 * - Auto-hide duration: 4 seconds (gives users time to read task feedback)
 * - Compact/dense mode for space efficiency
 * - Duplicate prevention (useful for preventing multiple API error notifications)
 *
 * **Positioning:**
 * - Bottom-left corner (mobile-friendly)
 * - Doesn't interfere with task list or app header
 * - Stacks vertically when multiple notifications active
 *
 * **Accessibility:**
 * - Variant-specific icons (checkmark, error, info, warning)
 * - ARIA labels on close buttons
 * - Keyboard accessible (can be dismissed with Escape key)
 * - Screen reader announcements (via ARIA live regions)
 *
 * **Usage:**
 * ```tsx
 * import { useSnackbar } from 'notistack';
 *
 * function MyComponent() {
 *   const { enqueueSnackbar } = useSnackbar();
 *
 *   const handleSuccess = () => {
 *     enqueueSnackbar('Task created successfully', { variant: 'success' });
 *   };
 *
 *   const handleError = () => {
 *     enqueueSnackbar('Failed to create task', { variant: 'error' });
 *   };
 *
 *   return <button onClick={handleSuccess}>Create Task</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Wrap app at root level
 * <ThemeProvider theme={theme}>
 *   <SnackbarProvider>
 *     <App />
 *   </SnackbarProvider>
 * </ThemeProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Success notification
 * enqueueSnackbar('Task completed!', { variant: 'success' });
 *
 * // Error notification
 * enqueueSnackbar('Failed to delete task', { variant: 'error' });
 *
 * // Warning notification
 * enqueueSnackbar('Task already exists', { variant: 'warning' });
 *
 * // Info notification
 * enqueueSnackbar('Syncing tasks...', { variant: 'info' });
 * ```
 *
 * @example
 * ```tsx
 * // Persistent notification (no auto-hide)
 * enqueueSnackbar('Important message', {
 *   variant: 'warning',
 *   persist: true,
 * });
 *
 * // Custom auto-hide duration
 * enqueueSnackbar('Quick message', {
 *   variant: 'info',
 *   autoHideDuration: 2000, // 2 seconds
 * });
 * ```
 */
export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  return (
    <NotistackProvider
      // Max number of snackbars displayed simultaneously
      maxSnack={env.VITE_SNACKBAR_MAX_COUNT}
      // Auto-hide duration (4 seconds gives users time to read task feedback)
      autoHideDuration={env.VITE_SNACKBAR_AUTO_HIDE}
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
      action={(snackbarKey: SnackbarKey) => (
        <CloseButton snackbarKey={snackbarKey} />
      )}
    >
      {children}
    </NotistackProvider>
  )
}
