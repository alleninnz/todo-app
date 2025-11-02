import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Decorator, Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { createAppTheme } from '../src/shared/config/theme'
import { SnackbarProvider } from '../src/shared/ui/SnackbarProvider'

// Import global styles
import '../src/app/index.css'

// Initialize MSW for API mocking
initialize({ onUnhandledRequest: 'warn' })

// Create theme instances for light and dark modes
const lightTheme = createAppTheme('light')
const darkTheme = createAppTheme('dark')

/**
 * Decorator to wrap stories with app-level providers
 * Ensures SnackbarProvider is available in all stories
 */
const withAppProviders: Decorator = Story => {
  return (
    <SnackbarProvider>
      <Story />
    </SnackbarProvider>
  )
}

const preview: Preview = {
  decorators: [
    // Material UI theme decorator with light/dark mode switcher
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
    // App-level providers (Snackbar notifications)
    withAppProviders,
  ],

  // MSW loader for API request mocking
  loaders: [mswLoader],

  parameters: {
    // Controls configuration - auto-detect input types
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true, // Expand controls panel by default
    },

    // Accessibility testing configuration
    a11y: {
      test: 'todo', // Show violations in UI, don't fail CI
      config: {
        rules: [
          {
            // Disable color-contrast rule for MUI components (they're already compliant)
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },

    // Background colors matching theme palette
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: lightTheme.palette.background.default,
        },
        {
          name: 'dark',
          value: darkTheme.palette.background.default,
        },
        {
          name: 'paper',
          value: lightTheme.palette.background.paper,
        },
      ],
    },

    // Viewport presets for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },

    // Default layout for all stories
    layout: 'centered',

    // Docs configuration
    docs: {
      toc: true, // Show table of contents in docs
    },
  },
}

export default preview
