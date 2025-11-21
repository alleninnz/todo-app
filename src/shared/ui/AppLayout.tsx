import { memo } from 'react'
import {
  AppBar,
  Box,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Outlet } from 'react-router'

/**
 * Responsive spacing configuration for consistent padding/margins
 * Pattern: mobile (xs) → tablet (md) → desktop (lg)
 */
const RESPONSIVE_SPACING = {
  /** Content padding (2 → 3 → 4) */
  CONTENT: { xs: 2, md: 3, lg: 4 },
} as const

/**
 * AppLayout - Application Shell Component
 *
 * Provides the main layout structure for the Todo App with:
 * - Sticky header with app branding
 * - Responsive main content area with consistent padding
 * - React Router outlet for page rendering
 *
 * **Architecture:**
 * - Pure MUI components (no Tailwind classes)
 * - Theme-integrated spacing and colors
 * - Semantic HTML structure
 * - Performance optimized with React.memo
 *
 * **Layout Structure:**
 * ```
 * ┌─────────────────────────────────┐
 * │ AppBar (Sticky Header)          │
 * │ ┌─────────────────────────────┐ │
 * │ │ Toolbar                     │ │
 * │ │ - App Title                 │ │
 * │ │ - Future: Navigation/Actions│ │
 * │ └─────────────────────────────┘ │
 * ├─────────────────────────────────┤
 * │ Main Content Area               │
 * │ ┌─────────────────────────────┐ │
 * │ │ Container (max-width: lg)   │ │
 * │ │ ┌─────────────────────────┐ │ │
 * │ │ │ <Outlet /> (Pages)      │ │ │
 * │ │ └─────────────────────────┘ │ │
 * │ └─────────────────────────────┘ │
 * └─────────────────────────────────┘
 * ```
 *
 * **Styling Strategy:**
 * - MUI Stack/Box for layout (consistent with project guidelines)
 * - MUI sx prop for visual styling (theme-integrated)
 * - Responsive spacing using theme breakpoints
 * - No Tailwind classes (pure MUI architecture)
 *
 * **Responsive Behavior:**
 * - Mobile (xs): 16px padding
 * - Tablet (md): 24px padding
 * - Desktop (lg): 32px padding
 *
 * **Extensibility:**
 * - Navigation menu can be added to Toolbar
 * - AppBar supports additional actions (search, user menu, notifications)
 * - Footer can be added after main content
 * - Side drawer/navigation can be integrated
 *
 * @example
 * ```tsx
 * // Basic usage in router
 * <Route element={<AppLayout />}>
 *   <Route path="/" element={<TasksPage />} />
 *   <Route path="/settings" element={<SettingsPage />} />
 * </Route>
 * ```
 *
 * @example
 * ```tsx
 * // With navigation (future enhancement)
 * <AppLayout>
 *   <Toolbar>
 *     <Typography>Todo App</Typography>
 *     <NavigationMenu />
 *   </Toolbar>
 * </AppLayout>
 * ```
 */
const AppLayoutComponent = () => {
  return (
    <Stack
      direction="column"
      sx={{
        minHeight: '100vh',
      }}
    >
      {/* Sticky App Header */}
      <AppBar
        component="header"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* App Branding */}
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'primary.contrastText',
              letterSpacing: -0.5,
            }}
            aria-label="Todo App"
          >
            Todo App
          </Typography>

          {/* Spacer - pushes future nav items to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Future Enhancement: Navigation menu, search, user actions */}
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: 'background.default',
          pt: RESPONSIVE_SPACING.CONTENT,
          pb: RESPONSIVE_SPACING.CONTENT,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            px: RESPONSIVE_SPACING.CONTENT,
          }}
        >
          {/* React Router renders page content here */}
          <Outlet />
        </Container>
      </Box>
    </Stack>
  )
}

// Memoize component - layout rarely changes props
AppLayoutComponent.displayName = 'AppLayout'
export const AppLayout = memo(AppLayoutComponent)
