import {
  useSnackbar as useNotistackSnackbar,
  type OptionsObject,
  type SnackbarKey,
  type SnackbarMessage,
} from 'notistack'

/**
 * Snackbar variant types as literal union for better type safety
 */
export type SnackbarVariant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

/**
 * Configuration options for snackbar notifications
 * Using Omit utility type to exclude variant from base options
 */
export interface SnackbarOptions extends Omit<OptionsObject, 'variant'> {
  /**
   * Optional action button configuration
   */
  readonly action?: OptionsObject['action']
  /**
   * Auto-hide duration override (milliseconds)
   */
  readonly autoHideDuration?: number
  /**
   * Prevent duplicate notification of the same message
   */
  readonly preventDuplicate?: boolean
}

/**
 * Enhanced Snackbar Hook
 *
 * Wraps notistack's useSnackbar with convenient helper methods for
 * common notification scenarios in the Todo App.
 *
 * Features:
 * - Type-safe variant helpers (success, error, warning, info)
 * - Consistent default options following app conventions
 * - Simplified API for common use cases
 * - Full access to underlying notistack functionality
 *
 * @example
 * ```tsx
 * const { showSuccess, showError } = useSnackbar();
 *
 * // Simple success message
 * showSuccess('Task created successfully');
 *
 * // Error with custom duration
 * showError('Failed to save task', { autoHideDuration: 6000 });
 *
 * // With action button
 * showWarning('Task archived', {
 *   action: (key) => <Button onClick={() => undo(key)}>Undo</Button>
 * });
 * ```
 */
/**
 * Strongly typed enqueue function signature
 */
type EnqueueFunction = (
  message: SnackbarMessage,
  variant: SnackbarVariant,
  options?: SnackbarOptions
) => SnackbarKey

/**
 * Variant-specific function signature for better DX
 */
type VariantFunction = (
  message: SnackbarMessage,
  options?: SnackbarOptions
) => SnackbarKey

export const useSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useNotistackSnackbar()

  /**
   * Base enqueue function with default options
   * Uses strict typing to prevent invalid variant values
   */
  const enqueue: EnqueueFunction = (
    message: SnackbarMessage,
    variant: SnackbarVariant,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueueSnackbar(message, {
      variant,
      ...options,
    })
  }

  /**
   * Show success notification (green)
   * Use for: Task created, updated, deleted, completed
   */
  const showSuccess: VariantFunction = (
    message: SnackbarMessage,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueue(message, 'success', options)
  }

  /**
   * Show error notification (red)
   * Use for: API failures, validation errors, unexpected errors
   */
  const showError: VariantFunction = (
    message: SnackbarMessage,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueue(message, 'error', {
      // Errors stay longer by default to ensure users see them
      autoHideDuration: 6000,
      ...options,
    })
  }

  /**
   * Show warning notification (orange)
   * Use for: Destructive actions, important reminders, edge cases
   */
  const showWarning: VariantFunction = (
    message: SnackbarMessage,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueue(message, 'warning', options)
  }

  /**
   * Show info notification (blue)
   * Use for: Helpful tips, feature explanations, non-critical updates
   */
  const showInfo: VariantFunction = (
    message: SnackbarMessage,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueue(message, 'info', options)
  }

  /**
   * Show default notification (neutral)
   * Use for: General messages without semantic meaning
   */
  const show: VariantFunction = (
    message: SnackbarMessage,
    options?: SnackbarOptions
  ): SnackbarKey => {
    return enqueue(message, 'default', options)
  }

  /**
   * Close a specific notification by key
   */
  const close = (key: SnackbarKey): void => {
    closeSnackbar(key)
  }

  /**
   * Close all active notifications
   */
  const closeAll = (): void => {
    closeSnackbar()
  }

  return {
    // Convenience helpers (recommended for most use cases)
    showSuccess,
    showError,
    showWarning,
    showInfo,
    show,

    // Close methods
    close,
    closeAll,

    // Raw notistack methods (for advanced use cases)
    enqueueSnackbar,
    closeSnackbar,
  }
}

/**
 * Precisely typed return interface for the hook
 * Using explicit interface instead of ReturnType for better IDE support
 */
export interface UseSnackbarReturn {
  // Convenience helpers (recommended for most use cases)
  readonly showSuccess: VariantFunction
  readonly showError: VariantFunction
  readonly showWarning: VariantFunction
  readonly showInfo: VariantFunction
  readonly show: VariantFunction

  // Close methods
  readonly close: (key: SnackbarKey) => void
  readonly closeAll: () => void

  // Raw notistack methods (for advanced use cases)
  readonly enqueueSnackbar: typeof useNotistackSnackbar extends () => infer R
    ? R extends { enqueueSnackbar: infer E }
      ? E
      : never
    : never
  readonly closeSnackbar: typeof useNotistackSnackbar extends () => infer R
    ? R extends { closeSnackbar: infer C }
      ? C
      : never
    : never
}
