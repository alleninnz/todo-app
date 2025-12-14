# Styling Strategy & Best Practices

## Design System Philosophy

This project uses **Material-UI v7.3.6** as the primary design system with **Tailwind CSS v4.1.17** for layout utilities only. This hybrid approach provides:

- **Consistency**: MUI theme enforces design tokens (colors, spacing, typography)
- **Productivity**: Pre-built accessible MUI components
- **Flexibility**: Tailwind utilities for rapid layout development
- **Maintainability**: Clear separation of concerns prevents style conflicts

## Component Styling Hierarchy

```text
┌─────────────────────────────────────────────────────┐
│ Level 1: Theme (Global)                             │
│ ├─ createAppTheme() in shared/config/theme.ts       │
│ └─ Applied via ThemeProvider                        │
├─────────────────────────────────────────────────────┤
│ Level 2: Component Defaults (Theme Components)      │
│ ├─ MuiButton, MuiTextField, etc.                    │
│ └─ defaultProps & styleOverrides                    │
├─────────────────────────────────────────────────────┤
│ Level 3: Reusable Styled Components                 │
│ ├─ const StyledCard = styled(Card)(...)             │
│ └─ For repeated component variations                │
├─────────────────────────────────────────────────────┤
│ Level 4: One-off Component Styles (sx prop)         │
│ ├─ <Box sx={{ p: 2, bgcolor: 'background.paper' }}> │
│ └─ For unique component styling                     │
├─────────────────────────────────────────────────────┤
│ Level 5: Layout Utilities (Tailwind)                │
│ ├─ className="flex gap-4 p-4"                       │
│ └─ Only for layout patterns                         │
└─────────────────────────────────────────────────────┘
```

## MUI Styling Patterns

### 1. Theme-Based Styling (Preferred for Global Styles)

**When to Use**: Global component defaults, design token customization

**Location**: `src/shared/config/theme.ts`

This is the actual theme configuration used in the project:

```typescript
import {
  createTheme,
  responsiveFontSizes,
  type ThemeOptions,
} from '@mui/material/styles'

/**
 * Align MUI breakpoints with Tailwind CSS for consistency
 * Prevents responsive behavior conflicts between the two systems
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
 * Component style overrides and default props
 * Optimized for Todo App UI patterns (forms, lists, buttons)
 */
const components: ThemeOptions['components'] = {
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
  MuiTextField: {
    defaultProps: {
      size: 'small',
      fullWidth: true,
      variant: 'outlined',
    },
  },
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
}

/**
 * Theme factory function
 * Creates a complete MUI theme with responsive typography
 */
export const createAppTheme = (mode: 'light' | 'dark' = 'light') => {
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

export const theme = createAppTheme('light')
```

**Benefits**:

- Centralized design decisions across the entire application
- Consistent styling enforced by MUI theme system
- Easy to maintain and update (single source of truth)
- Type-safe with TypeScript
- Automatic responsive font sizes
- Aligned breakpoints with Tailwind CSS (no conflicts)

### 2. sx Prop (Preferred for Component-Specific Styles)

**When to Use**: One-off styling, responsive design, theme token access

```typescript
// ✅ CORRECT - Dynamic styling with theme access
<Box
  sx={{
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 2,
    },
    // Responsive values
    width: { xs: '100%', md: '50%' },
  }}
>
  {children}
</Box>

// ✅ CORRECT - Access theme in functions
<Button
  sx={{
    backgroundColor: (theme) => theme.palette.primary.main,
    color: (theme) => theme.palette.primary.contrastText,
  }}
>
  Submit
</Button>

// ✅ CORRECT - Shorthand theme access
<Typography sx={{ color: 'text.secondary', mb: 2 }}>
  Description
</Typography>
```

**Benefits**:

- Directly access theme tokens
- Supports responsive values
- Type-safe with IntelliSense
- No CSS-in-JS boilerplate

**❌ WRONG - Avoid hardcoded values**:

```typescript
// ❌ BAD - Hardcoded colors instead of theme
<Box sx={{ backgroundColor: '#1976d2', color: '#ffffff' }}>
  {children}
</Box>

// ✅ CORRECT - Use theme tokens
<Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
  {children}
</Box>
```

### 3. styled() API (For Reusable Component Variants)

**When to Use**: Creating reusable styled component variants, complex conditional styling

```typescript
// ✅ CORRECT - Reusable styled component
import { styled } from '@mui/material/styles'
import { Card } from '@mui/material'

const TaskCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}))

// With props
interface StyledTaskItemProps {
  completed: boolean
}

const StyledTaskItem = styled('div')<StyledTaskItemProps>(
  ({ theme, completed }) => ({
    padding: theme.spacing(1.5),
    textDecoration: completed ? 'line-through' : 'none',
    opacity: completed ? 0.6 : 1,
  })
)
```

**Benefits**:

- Reusable across components
- Supports TypeScript props
- Better performance for repeated styles
- Theme-aware by default

## Tailwind CSS Usage

**✅ ALLOWED - Layout Utilities Only**:

```typescript
// ✅ CORRECT - Layout and spacing
<div className="flex items-center gap-4 p-4">
  <div className="flex-1 grid grid-cols-2 gap-2">
    {children}
  </div>
</div>

// ✅ CORRECT - Responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(...)}
</div>

// ✅ CORRECT - Flexbox utilities
<div className="flex flex-col md:flex-row justify-between items-start">
  {content}
</div>
```

**Allowed Tailwind Utilities**:

- **Flexbox**: `flex`, `flex-col`, `flex-row`, `items-*`, `justify-*`, `flex-1`, `flex-wrap`
- **Grid**: `grid`, `grid-cols-*`, `grid-rows-*`, `col-span-*`, `row-span-*`
- **Spacing**: `p-*`, `m-*`, `gap-*`, `space-x-*`, `space-y-*`
- **Sizing**: `w-*`, `h-*`, `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*`
- **Position**: `relative`, `absolute`, `fixed`, `sticky`, `inset-*`, `top-*`, `left-*`

**❌ FORBIDDEN - Visual Styling**:

```typescript
// ❌ WRONG - Never use Tailwind for colors
<div className="bg-blue-500 text-white border-gray-300">
  {children}
</div>

// ✅ CORRECT - Use MUI for visual styling
<Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', border: 1, borderColor: 'divider' }}>
  {children}
</Box>

// ❌ WRONG - Never use Tailwind for typography
<p className="text-2xl font-bold text-gray-800">
  Title
</p>

// ✅ CORRECT - Use MUI Typography
<Typography variant="h4" fontWeight="bold" color="text.primary">
  Title
</Typography>
```

**Forbidden Tailwind Utilities**:

- **Colors**: `bg-*`, `text-*`, `border-*` (use MUI theme colors)
- **Typography**: `text-*`, `font-*`, `leading-*` (use MUI Typography)
- **Borders**: `border-*`, `rounded-*` (use MUI sx or theme)
- **Shadows**: `shadow-*` (use MUI elevation)
- **Effects**: `opacity-*`, `blur-*` (use MUI sx)

## Dynamic Styling Patterns

### Conditional Styling with Props

```typescript
// ✅ CORRECT - Map props to complete class strings
interface TaskItemProps {
  priority: 'none' | 'low' | 'medium' | 'high'
  completed: boolean
}

const TaskItem = ({ priority, completed }: TaskItemProps) => {
  // Layout classes from Tailwind
  const layoutClasses = 'flex items-center gap-3 p-3'

  return (
    <Box
      className={layoutClasses}
      sx={{
        // Visual styling from MUI theme
        bgcolor: completed ? 'action.hover' : 'background.paper',
        borderLeft: 4,
        borderColor: priorityColors[priority],
        opacity: completed ? 0.6 : 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {content}
    </Box>
  )
}

// Priority color mapping using theme
const priorityColors = {
  none: 'neutral.main',
  low: 'info.main',
  medium: 'warning.main',
  high: 'error.main',
} as const
```

### Responsive Design

```typescript
// ✅ CORRECT - MUI breakpoints with sx prop
<Box
  sx={{
    // Responsive padding
    p: { xs: 2, md: 3, lg: 4 },
    // Responsive width
    width: { xs: '100%', md: '75%', lg: '50%' },
    // Responsive display
    display: { xs: 'block', md: 'flex' },
  }}
>
  {children}
</Box>

// ✅ CORRECT - Tailwind responsive utilities for layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items}
</div>
```

**Breakpoint Reference** (Aligned MUI + Tailwind):

Both MUI theme and Tailwind CSS are configured with **identical breakpoints** to prevent conflicts:

**Real Configuration** (`src/shared/config/theme.ts`):

```typescript
/**
 * Align MUI breakpoints with Tailwind CSS for consistency
 * Tailwind: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
 * This prevents responsive behavior conflicts between the two systems
 */
const breakpoints: ThemeOptions['breakpoints'] = {
  values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
}
```

**Breakpoint Values:**

- `xs: 0px` - Mobile first (default, always active)
- `sm: 640px` - Small tablet / Large phone (matches Tailwind `sm:`)
- `md: 768px` - Tablet (matches Tailwind `md:`)
- `lg: 1024px` - Desktop (matches Tailwind `lg:`)
- `xl: 1280px` - Large desktop (matches Tailwind `xl:`)

**Usage Example:**

```typescript
// MUI sx prop
<Box sx={{ p: { xs: 2, md: 3, lg: 4 } }} />

// Tailwind classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
```

Both approaches trigger at the same screen widths, ensuring consistent responsive behavior.

## Import Conventions

```typescript
// MUI Components
import { Box, Button, Typography, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'

// Theme
import { theme } from '@/shared/config/theme'
```

## Common Patterns

### Card Component

```typescript
import { Card, CardContent, CardActions, Button } from '@mui/material'

const TaskCard = () => (
  <Card
    className="flex flex-col" // Tailwind layout
    sx={{
      // MUI visual styling
      borderRadius: 2,
      boxShadow: 1,
      '&:hover': { boxShadow: 2 },
    }}
  >
    <CardContent className="flex-1"> // Tailwind flex
      {/* Content */}
    </CardContent>
    <CardActions className="flex justify-end gap-2"> // Tailwind layout
      <Button variant="outlined">Cancel</Button>
      <Button variant="contained">Save</Button>
    </CardActions>
  </Card>
)
```

### Form Layout

```typescript
import { TextField, Button } from '@mui/material'

const TaskForm = () => (
  <form className="flex flex-col gap-4"> {/* Tailwind layout */}
    <TextField
      label="Task Title"
      fullWidth
      sx={{ bgcolor: 'background.paper' }} // MUI styling
    />
    <TextField
      label="Description"
      multiline
      rows={4}
      fullWidth
    />
    <div className="flex justify-end gap-2"> {/* Tailwind layout */}
      <Button variant="outlined">Cancel</Button>
      <Button variant="contained" type="submit">
        Create Task
      </Button>
    </div>
  </form>
)
```

### List with Items

```typescript
import { List, ListItem, ListItemText, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const TaskList = ({ tasks }: { tasks: Task[] }) => (
  <List className="flex flex-col gap-2"> {/* Tailwind layout */}
    {tasks.map(task => (
      <ListItem
        key={task.id}
        className="flex items-center gap-3" // Tailwind layout
        sx={{
          // MUI visual styling
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <ListItemText
          primary={task.title}
          secondary={task.description}
          className="flex-1" // Tailwind layout
        />
        <IconButton
          onClick={() => handleDelete(task.id)}
          sx={{ color: 'error.main' }} // MUI color
        >
          <DeleteIcon />
        </IconButton>
      </ListItem>
    ))}
  </List>
)
```

## Accessibility Best Practices

```typescript
// ✅ CORRECT - Semantic HTML + ARIA
<Box
  component="section"
  role="region"
  aria-labelledby="tasks-heading"
  sx={{ p: 3 }}
>
  <Typography id="tasks-heading" variant="h2">
    My Tasks
  </Typography>
  {/* Task list */}
</Box>

// ✅ CORRECT - Interactive elements
<IconButton
  onClick={handleDelete}
  aria-label="Delete task"
  size="small"
  sx={{ color: 'error.main' }}
>
  <DeleteIcon />
</IconButton>
```

## Performance Considerations

1. **Theme Access**: Use `sx` prop for theme access (optimized)
2. **Static Styles**: Use `styled()` for repeated component styles (cached)
3. **Tailwind Purging**: Only used utilities are included (automatic in v4)
4. **Avoid Inline Objects**: Extract style objects if used multiple times

```typescript
// ❌ WRONG - Creates new object on every render
<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  {items.map(item => (
    <Box key={item.id} sx={{ mb: 1 }}> // New object each iteration
      {item.name}
    </Box>
  ))}
</Box>

// ✅ CORRECT - Extract or use styled component
const itemStyle = { mb: 1 } // Reused

<Box sx={{ p: 2, bgcolor: 'background.paper' }}>
  {items.map(item => (
    <Box key={item.id} sx={itemStyle}>
      {item.name}
    </Box>
  ))}
</Box>

// ✅ BETTER - Use styled component for repeated styles
const ItemBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}))
```

## Decision Matrix

| Scenario                      | Tool                              | Rationale                                      |
| ----------------------------- | --------------------------------- | ---------------------------------------------- |
| Layout structure (flex, grid) | Tailwind classes                  | Quick, readable, utility-first                 |
| Component colors, shadows     | MUI sx prop                       | Theme consistency, dark mode ready             |
| Reusable component variant    | MUI styled()                      | Performance, type safety                       |
| Global component defaults     | MUI theme                         | Single source of truth                         |
| Responsive design             | Both (MUI breakpoints + Tailwind) | MUI for visual, Tailwind for layout            |
| Typography                    | MUI Typography                    | Theme integration, semantic HTML               |
| Spacing/margins               | Tailwind OR MUI sx                | Tailwind for layout, sx for component-specific |
| Hover/focus states            | MUI sx prop                       | Theme-aware, consistent interaction            |
