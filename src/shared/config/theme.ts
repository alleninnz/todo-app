import {
  createTheme,
  responsiveFontSizes,
  type ThemeOptions,
} from '@mui/material/styles'

/**
 * Extend MUI palette with custom neutral color
 * Useful for task status indicators and secondary UI elements
 */
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary']
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary']
  }
}

/**
 * Color mode type for theme switching
 * Currently supports light mode, dark mode can be added later
 */
export type ColorMode = 'light' | 'dark'

/**
 * Align MUI breakpoints with Tailwind CSS for consistency
 * Tailwind: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
 * This prevents responsive behavior conflicts between the two systems
 */
const breakpoints: ThemeOptions['breakpoints'] = {
  values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
}

/**
 * Light mode color palette
 * Optimized for Todo App with task priority and status colors
 */
const lightPalette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: { main: '#1976d2' }, // Primary actions (create, edit tasks)
  secondary: { main: '#9c27b0' }, // Secondary emphasis (filters, tags)
  error: { main: '#d32f2f' }, // High priority tasks, delete actions
  warning: { main: '#ed6c02' }, // Medium priority tasks, warnings
  info: { main: '#0288d1' }, // Low priority tasks, info messages
  success: { main: '#2e7d32' }, // Completed tasks, success feedback
  neutral: { main: '#64748B' }, // Neutral UI elements (slate-500)
  background: {
    default: '#f8fafc', // Lighter background for better contrast
    paper: '#ffffff',
  },
}

/**
 * Dark mode color palette
 * Reserved for future dark mode implementation
 */
const darkPalette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: { main: '#90caf9' },
  secondary: { main: '#ce93d8' },
  error: { main: '#ef5350' },
  warning: { main: '#ffb74d' },
  info: { main: '#81d4fa' },
  success: { main: '#66bb6a' },
  neutral: { main: '#94A3B8' }, // slate-400
  background: {
    default: '#0b1020', // Deep background for dark mode
    paper: '#111827', // Tailwind slate-900 equivalent
  },
}

/**
 * Typography configuration
 * Using system font stack for better performance and native feel
 * Button text is not transformed to uppercase for modern UI consistency
 */
const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
  ].join(','),
  // Heading levels optimized for task lists and forms
  h1: { fontWeight: 700, letterSpacing: -0.5 },
  h2: { fontWeight: 700, letterSpacing: -0.5 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  // Keep button text readable (no uppercase transformation)
  button: { textTransform: 'none', fontWeight: 600 },
  // Body text optimized for readability in task descriptions
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.5 },
}

/**
 * Shape configuration for consistent border radius
 * Applied to buttons, cards, inputs, and task items
 */
const shape: ThemeOptions['shape'] = {
  borderRadius: 8, // Slightly reduced for cleaner look in dense lists
}

/**
 * Component style overrides and default props
 * Optimized for Todo App UI patterns (forms, lists, buttons)
 */
const components: ThemeOptions['components'] = {
  // Button: Compact size for dense UI, flat design (no elevation)
  MuiButton: {
    defaultProps: {
      size: 'medium',
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        padding: '8px 16px',
      },
      sizeSmall: {
        padding: '6px 12px',
      },
    },
  },
  // IconButton: Optimized for task item actions (edit, delete, complete)
  MuiIconButton: {
    defaultProps: {
      size: 'medium',
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  // TextField: Compact inputs for task forms
  MuiTextField: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
      variant: 'outlined',
    },
  },
  // FormControl: Consistent sizing across form elements
  MuiFormControl: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
    },
  },
  // Checkbox: Used for task completion toggle
  MuiCheckbox: {
    defaultProps: {
      size: 'medium',
    },
  },
  // Chip: Used for task priority and tags
  MuiChip: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  // Paper: Cards and dialogs with subtle shadows
  MuiPaper: {
    styleOverrides: {
      rounded: { borderRadius: 12 },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
      elevation2: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  // ListItemButton: Smooth hover effect for task items
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
  // Dialog: Task form and confirmation dialogs
  MuiDialog: {
    defaultProps: {
      PaperProps: {
        elevation: 3,
      },
    },
  },
  // CssBaseline: Global baseline styles for consistency
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      body: {
        backgroundColor: 'var(--mui-body-bg, inherit)',
      },
      // Custom scrollbar styling for WebKit browsers
      '::-webkit-scrollbar': {
        width: 8,
        height: 8,
      },
      '::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(100,116,139,0.3)',
        borderRadius: 4,
        '&:hover': {
          backgroundColor: 'rgba(100,116,139,0.5)',
        },
      },
    },
  },
}

/**
 * Z-index configuration for layered UI elements
 * Ensures proper stacking of modals, dialogs, and notifications
 */
const zIndex: ThemeOptions['zIndex'] = {
  snackbar: 1400,
  modal: 1300,
  drawer: 1200,
  appBar: 1100,
}

/**
 * Theme factory function
 * Creates a complete MUI theme with responsive typography
 *
 * @param mode - Color mode ('light' or 'dark')
 * @returns Theme object with all customizations applied
 */
export function createAppTheme(mode: ColorMode = 'light') {
  const theme = createTheme({
    breakpoints,
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography,
    shape,
    components,
    zIndex,
  })

  // Apply responsive font sizing for better mobile experience
  return responsiveFontSizes(theme, {
    breakpoints: ['sm', 'md', 'lg'],
    factor: 2,
  })
}

/**
 * Default theme instance
 * Light mode theme used throughout the application
 * Can be replaced with dark mode by calling createAppTheme('dark')
 */
export const theme = createAppTheme('light')
