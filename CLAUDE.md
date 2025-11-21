# AI Assistant Guide for Todo App

> **Target Audience**: AI coding assistants (Claude, GPT, etc.) working on this React + TypeScript todo application.
>
> **Purpose**: Quick reference for project architecture, conventions, and implementation status to ensure consistent, high-quality contributions.

## 📋 Quick Reference

- **Stack**: React 19 + TypeScript 5.9 + Vite (Rolldown)
- **UI**: Material-UI v7 + Tailwind CSS v4
- **State**: Zustand (client state) + React Hook Form (forms)
- **HTTP**: Ky with automatic camelCase ↔ snake_case conversion
- **Validation**: Zod schemas
- **Testing**: Vitest + React Testing Library + MSW
- **Architecture**: Feature-first, domain-driven design

## 🎯 Project Status (Phase-Based)

### ✅ Phase A: Foundation Layer (COMPLETED)

**What's Done:**

- ✅ Type system: `shared/types/task.types.ts` - Complete Task domain model
- ✅ HTTP client: `shared/api/httpClient.ts` - Auto case conversion, retry, error handling
- ✅ Validation: `features/tasks/validation/task.schema.ts` - Zod schemas
- ✅ Custom hooks: `useAsyncState`, `useSnackbar` in `shared/hooks/`
- ✅ Utilities: Date/format helpers in `shared/lib/`
- ✅ Test infrastructure: Vitest + MSW configured
- ✅ Theme: MUI theme in `shared/config/theme.ts`
- ✅ UI components: ErrorBoundary, Layout, SnackbarProvider

**Key Achievements:**

- httpClient handles **automatic camelCase/snake_case conversion** - no manual mapping needed
- useAsyncState provides **race condition protection** and optimistic updates
- Complete type safety with discriminated unions

### 🚧 Phase B: Task Feature (IN PROGRESS)

**What Needs Implementation:**

- 🚧 `features/tasks/services/task.service.ts` - CRUD API calls
- 🚧 `features/tasks/store/tasks.store.ts` - Zustand store
- 🚧 `features/tasks/hooks/useTaskActions.ts` - Async operations wrapper
- 🚧 `features/tasks/hooks/useTaskDetail.ts` - Single task fetching
- 🚧 `features/tasks/components/` - TaskList, TaskItem, TaskForm, EmptyState

**Stub Files (To Implement):**

```text
src/features/tasks/
├── services/
│   ├── task.service.ts      # TODO: Implement
├── store/
│   └── tasks.store.ts       # TODO: Implement
├── hooks/
│   ├── useTaskActions.ts    # TODO: Implement
│   └── useTaskDetail.ts     # TODO: Implement
└── components/
    ├── TaskList.tsx         # TODO: Implement
    ├── TaskItem.tsx         # TODO: Implement
    ├── TaskForm.tsx         # TODO: Implement
    └── TaskEmptyState.tsx   # TODO: Implement
```

### ⏳ Phase C: Lists Feature (PENDING)

- FilterBar, SortMenu, StatusTabs components
- useListFilters hook

### ⏳ Phase D: App Shell (PENDING)

- TasksPage composition
- Route integration

### ⏳ Phase E: Quality Assurance (PENDING)

- Test coverage ≥80%
- Accessibility audit
- Performance optimization

## 🏗️ Architecture Principles

### 1. Feature-First Organization

```text
src/
├── features/           # Domain-driven features
│   ├── tasks/         # Self-contained task domain
│   └── lists/         # Self-contained list filtering
├── shared/            # Cross-domain infrastructure
└── app/               # Application shell
```

**Rules:**

- Features are **self-contained** with their own components/hooks/services/stores
- Features export public API via `index.ts` barrels
- Shared code goes in `shared/` (types, utils, hooks, UI)

### 2. Layer Separation

| Layer          | Files         | Purpose          | Rules                           |
| -------------- | ------------- | ---------------- | ------------------------------- |
| **UI**         | `.tsx`        | React components | No direct HTTP calls, use hooks |
| **Business**   | `.hooks.ts`   | Orchestration    | Call services, update stores    |
| **Service**    | `.service.ts` | API calls        | Pure functions, no React        |
| **Store**      | `.store.ts`   | State            | Sync state only, no async       |
| **Types**      | `.types.ts`   | Type definitions | No implementation               |
| **Validation** | `.schema.ts`  | Zod schemas      | Form validation                 |

### 3. Naming Conventions

| Suffix        | Purpose          | Example               |
| ------------- | ---------------- | --------------------- |
| `.types.ts`   | Type definitions | `task.types.ts`       |
| `.store.ts`   | Zustand store    | `tasks.store.ts`      |
| `.service.ts` | API service      | `task.service.ts`     |
| `.schema.ts`  | Zod validation   | `task.schema.ts`      |
| `.test.ts(x)` | Tests            | `task.schema.test.ts` |

**⚠️ Deprecated Patterns (DO NOT USE):**

- ❌ `.mapper.ts` - httpClient does auto-conversion
- ❌ `.paths.ts` - Define paths inline in services

## 🔑 Critical Implementation Details

### HTTP Client Auto-Conversion

**Frontend sends camelCase, backend receives snake_case automatically:**

```typescript
// ✅ CORRECT - Send camelCase
await httpClient.post('tasks', {
  json: {
    taskTitle: 'Buy groceries', // camelCase
    dueDate: '2024-01-15',
  },
})
// Backend receives: { task_title: '...', due_date: '...' }

// ✅ CORRECT - Receive camelCase
const task = await httpClient.get<Task>('tasks/123')
// Backend returns: { task_id: '123', created_at: '...' }
// Frontend gets: { taskId: '123', createdAt: '...' }
```

**❌ DO NOT create manual mappers** - httpClient handles this automatically.

### Type System

**Single Source of Truth**: `shared/types/task.types.ts`

```typescript
// Core types
Task // Full task with id and createdAt
TaskDraft // For creation (omits id, createdAt)
TaskUpdate // For updates (all fields optional)
TaskPriority // 'none' | 'low' | 'medium' | 'high'
TaskStatus // 'all' | 'active' | 'completed'

// UI state types
TaskFilters // Filter criteria
TaskSortOption // Sort configuration
```

**⚠️ Important**: No separate DTO types needed - use domain types directly.

### Async State Management

**Use `useAsyncState` for all async operations:**

```typescript
const { execute, isLoading, data, error } = useAsyncState<Task>({
  onSuccess: task => showSuccess(`Created ${task.title}`),
  onError: err => showError(err.message),
})

const handleCreate = async (input: TaskDraft) => {
  await execute(() => taskService.createTask(input))
}
```

**Features:**

- ✅ Automatic race condition protection
- ✅ Loading/success/error states
- ✅ Lifecycle callbacks
- ✅ Optimistic updates support

### Store Pattern

**Zustand stores handle SYNC state only:**

```typescript
// ✅ CORRECT - Store
interface TasksStore {
  items: Task[]
  isLoading: boolean
  error: string | null

  // Sync actions only
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: TaskUpdate) => void
  removeTask: (id: string) => void
}

// ✅ CORRECT - Hook handles async
const useTaskActions = () => {
  const store = useTasksStore()
  const { execute } = useAsyncState()

  const loadTasks = () =>
    execute(async () => {
      const tasks = await taskService.fetchTasks()
      store.setTasks(tasks)
      return tasks
    })

  return { loadTasks }
}
```

## 📚 Key Documentation

| Doc                           | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `docs/requirements.md`        | Feature requirements & success criteria     |
| `docs/implementation-spec.md` | Phase-by-phase implementation guide         |
| `docs/overview.md`            | Architecture overview (Chinese)             |
| `docs/hooks.md`               | useAsyncState & useSnackbar guide (Chinese) |
| `README.md`                   | Setup, scripts, conventions                 |

## 🚀 Development Workflow

### Starting Work

1. **Check current phase** in this document
2. **Read relevant docs** (implementation-spec.md for current phase)
3. **Review existing code** in `shared/` for patterns
4. **Run tests** before making changes: `pnpm test`

### Implementation Checklist

When implementing a new feature:

- [ ] Follow naming conventions (`.service.ts`, `.store.ts`, etc.)
- [ ] Use `httpClient` for API calls (auto-converts case)
- [ ] Use `useAsyncState` for async operations
- [ ] Define types in appropriate `.types.ts` file
- [ ] Add Zod schema for validation if needed
- [ ] Create unit tests (co-locate in `__tests__/`)
- [ ] Export public API via `index.ts` barrel
- [ ] Update this document if architecture changes

### Code Quality Gates

**Must pass before committing:**

```bash
pnpm lint        # ESLint check
pnpm format      # Prettier formatting
pnpm test        # Unit tests
pnpm build       # TypeScript compilation
```

## ⚠️ Common Pitfalls to Avoid

### 1. ❌ Creating Manual Mappers

```typescript
// ❌ WRONG - Don't create mappers
const toDTO = (task: Task) => ({ task_id: task.id, ... })

// ✅ CORRECT - httpClient handles this
await httpClient.post('tasks', { json: task })
```

### 2. ❌ Async Logic in Stores

```typescript
// ❌ WRONG - Async in store
const useTasksStore = create((set) => ({
  loadTasks: async () => {
    const tasks = await fetch(...)
    set({ tasks })
  }
}))

// ✅ CORRECT - Async in hooks
const useTaskActions = () => {
  const store = useTasksStore()
  const { execute } = useAsyncState()

  const loadTasks = () => execute(async () => {
    const tasks = await taskService.fetchTasks()
    store.setTasks(tasks)
  })
}
```

### 3. ❌ Duplicate Type Definitions

```typescript
// ❌ WRONG - Feature-specific task types
// src/features/tasks/types/task.types.ts

// ✅ CORRECT - Use shared types
import { Task, TaskDraft } from '@shared/types/task.types'
```

### 4. ❌ Direct Component HTTP Calls

```typescript
// ❌ WRONG - HTTP in component
const TaskList = () => {
  useEffect(() => {
    fetch('/api/tasks').then(...)
  }, [])
}

// ✅ CORRECT - HTTP in service, called via hook
const TaskList = () => {
  const { loadTasks, tasks, isLoading } = useTaskActions()
  useEffect(() => { loadTasks() }, [loadTasks])
}
```

## 🔧 Code Templates

### Service Template

```typescript
// features/tasks/services/task.service.ts
import { httpClient } from '@shared/api/httpClient'
import type { Task, TaskDraft, TaskUpdate } from '@shared/types/task.types'

const API_BASE = '/tasks'

export const taskService = {
  async fetchTasks(): Promise<Task[]> {
    return httpClient.get<Task[]>(API_BASE)
  },

  async fetchTask(id: string): Promise<Task> {
    return httpClient.get<Task>(`${API_BASE}/${id}`)
  },

  async createTask(draft: TaskDraft): Promise<Task> {
    return httpClient.post<Task>(API_BASE, { json: draft })
  },

  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    return httpClient.patch<Task>(`${API_BASE}/${id}`, { json: updates })
  },

  async deleteTask(id: string): Promise<void> {
    return httpClient.delete<void>(`${API_BASE}/${id}`)
  },
}
```

### Store Template

```typescript
// features/tasks/store/tasks.store.ts
import { create } from 'zustand'
import type {
  Task,
  TaskFilters,
  TaskSortOption,
} from '@shared/types/task.types'

interface TasksStore {
  // State
  items: Task[]
  filters: TaskFilters
  sort: TaskSortOption
  isLoading: boolean
  error: string | null

  // Sync actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setFilters: (filters: TaskFilters) => void
  setSort: (sort: TaskSortOption) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTasksStore = create<TasksStore>(set => ({
  items: [],
  filters: { status: 'all' },
  sort: { field: 'createdAt', direction: 'desc' },
  isLoading: false,
  error: null,

  setTasks: tasks => set({ items: tasks }),
  addTask: task => set(state => ({ items: [...state.items, task] })),
  updateTask: (id, updates) =>
    set(state => ({
      items: state.items.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: id =>
    set(state => ({
      items: state.items.filter(task => task.id !== id),
    })),
  setFilters: filters => set({ filters }),
  setSort: sort => set({ sort }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),
}))
```

### Hook Template

```typescript
// features/tasks/hooks/useTaskActions.ts
import { useCallback } from 'react'
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { useSnackbar } from '@shared/hooks/useSnackbar'
import { taskService } from '../services/task.service'
import { useTasksStore } from '../store/tasks.store'
import type { TaskDraft, TaskUpdate } from '@shared/types/task.types'

export const useTaskActions = () => {
  const store = useTasksStore()
  const { showSuccess, showError } = useSnackbar()

  const { execute: executeLoad, isLoading } = useAsyncState({
    onSuccess: tasks => store.setTasks(tasks),
    onError: () => showError('Failed to load tasks'),
  })

  const { execute: executeCreate } = useAsyncState({
    onSuccess: task => {
      store.addTask(task)
      showSuccess(`Created "${task.title}"`)
    },
    onError: () => showError('Failed to create task'),
  })

  const loadTasks = useCallback(() => {
    return executeLoad(() => taskService.fetchTasks())
  }, [executeLoad])

  const createTask = useCallback(
    (draft: TaskDraft) => {
      return executeCreate(() => taskService.createTask(draft))
    },
    [executeCreate]
  )

  return {
    tasks: store.items,
    isLoading,
    loadTasks,
    createTask,
  }
}
```

## 🎨 UI Component Patterns

### Loading States

```typescript
if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorState error={error} onRetry={loadTasks} />
if (!data?.length) return <EmptyState />
```

### Form with Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema } from '../validation/task.schema'

const TaskForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema)
  })

  const onSubmit = (data) => createTask(data)

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
// features/tasks/services/__tests__/task.service.test.ts
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '@test/mocks/server'
import { http, HttpResponse } from 'msw'
import { taskService } from '../task.service'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('taskService', () => {
  it('should fetch tasks', async () => {
    const tasks = await taskService.fetchTasks()
    expect(tasks).toHaveLength(2)
  })
})
```

### MSW Handlers

Define API mocks in `src/test/mocks/handlers.ts`:

```typescript
export const handlers = [
  http.get('/tasks', () => {
    return HttpResponse.json([
      { task_id: '1', task_title: 'Test', completed: false },
    ])
  }),
]
```

## 🎯 Next Steps for Implementation

### Immediate Priority (Phase B)

1. **task.service.ts** - Implement all CRUD operations
2. **tasks.store.ts** - Create Zustand store with sync actions
3. **useTaskActions.ts** - Connect service + store + async state
4. **TaskList.tsx** - Display tasks with loading/error/empty states
5. **TaskForm.tsx** - Create/edit form with validation
6. **Tests** - Unit tests for service, store, hooks

### Reference Implementations

- **Service**: See httpClient.ts for HTTP patterns
- **Store**: See shared types for state shape
- **Hook**: See useAsyncState for async patterns
- **Validation**: See task.schema.ts for Zod examples

## 🎨 Styling Strategy & Best Practices

### Design System Philosophy

This project uses **Material-UI v7** as the primary design system with **Tailwind CSS v4** for layout utilities only. This hybrid approach provides:

- **Consistency**: MUI theme enforces design tokens (colors, spacing, typography)
- **Productivity**: Pre-built accessible MUI components
- **Flexibility**: Tailwind utilities for rapid layout development
- **Maintainability**: Clear separation of concerns prevents style conflicts

### Component Styling Hierarchy

```
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

### MUI Styling Patterns

#### 1. Theme-Based Styling (Preferred for Global Styles)

**When to Use**: Global component defaults, design token customization

```typescript
// ✅ CORRECT - Define in theme.ts
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
      },
    },
  },
}
```

**Benefits**:

- Centralized design decisions
- Consistent across entire app
- Easy to maintain and update
- Type-safe with TypeScript

#### 2. sx Prop (Preferred for Component-Specific Styles)

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

#### 3. styled() API (For Reusable Component Variants)

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

### Tailwind CSS Usage

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

### Dynamic Styling Patterns

#### Conditional Styling with Props

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

#### Responsive Design

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

```typescript
{
  xs: 0,    // Mobile first (default)
  sm: 640,  // Small tablet
  md: 768,  // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large desktop
}
```

### Import Conventions

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

### Common Patterns

#### Card Component

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

#### Form Layout

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

#### List with Items

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

### Accessibility Best Practices

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

### Performance Considerations

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

### Decision Matrix

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

## 📝 Maintenance Notes

**When to Update This Doc:**

- Phase completion (update status markers)
- Architecture changes (update principles)
- New patterns introduced (add to templates)
- Breaking changes (update pitfalls)

**Last Updated**: November 19, 2025
**Current Phase**: B (Task Feature - In Progress)
**Next Milestone**: Complete TaskList + TaskForm components

---

**For more details**: Read `docs/implementation-spec.md` for detailed phase instructions.
