# Custom Hooks Guide

This project provides a powerful set of React Hooks to simplify async state management and user feedback notifications.

## Table of Contents

- [React Query Integration](#react-query-integration) - Data Fetching & Caching
- [useTasks](#usetasks) - Task Query Hook
- [useTaskActions](#usetaskactions) - Task Mutation Hook
- [useSnackbar](#usesnackbar) - Global Notification System

---

## React Query Integration

**Library**: `@tanstack/react-query` v5.90.12

We use React Query for all server state management (fetching, caching, synchronizing and updating server state). It provides automatic background updates, optimistic updates, and intelligent caching.

### Core Principles

- **Server State**: Data that persists remotely (API), managed by React Query.
- **Client State**: UI state (modals, form inputs), managed by Zustand or `useState`.
- **Stale-While-Revalidate**: Data is cached and background updated.
- **Optimistic Updates**: UI updates immediately, rolls back on error.

### Query Client Configuration

React Query is configured globally in the application through the `@tanstack/react-query` provider. The application uses React Query v5.90.12 for server state management with automatic caching, background updates, and intelligent refetching.

**Provider Setup** (`src/app/providers.tsx`):

```tsx
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary'
import { SnackbarProvider } from '@/shared/ui'
import { ThemeProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { theme } from '@/shared/config/theme'
import { env } from '@/shared/config/env'

// Initialize MSW when feature flag is enabled
if (env.VITE_ENABLE_MSW && import.meta.env.DEV) {
  const { worker } = await import('@/test/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'warn',
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
```

**Note**: React Query is configured with default options at the hook level (see `useTasks` implementation below).

---

## useTasks

**Location**: `src/features/tasks/hooks/useTasks.ts`

React Query hook for fetching tasks with client-side filtering and sorting. This hook combines server state management with client-side data transformations.

### useTasks Features

- ✅ **Automatic Caching** - Fetched tasks are cached for 30 seconds (configurable)
- ✅ **Client-Side Filtering** - Filter by status (all/active/completed) and priority
- ✅ **Client-Side Sorting** - Sort by createdAt, dueDate, or priority with asc/desc direction
- ✅ **Derived Counts** - Automatic totalCount, activeCount, completedCount from raw data
- ✅ **Loading States** - isLoading, isEmpty, hasTasks helpers
- ✅ **Performance Optimized** - Uses useMemo for filtered/sorted results

### useTasks API

```typescript
interface UseTasksOptions {
  filters?: TaskFilters // { status: 'all' | 'active' | 'completed', priority?: TaskPriority }
  sort?: TaskSortOption // { field: 'createdAt' | 'dueDate' | 'priority', direction: 'asc' | 'desc' }
  enabled?: boolean // Enable/disable query (default: true)
  staleTime?: number // Cache duration in ms (default: 30000)
}

interface UseTasksResult {
  // Filtered and sorted tasks
  tasks: Task[]
  allTasks: Task[] | undefined // Raw unfiltered data

  // Derived counts
  totalCount: number
  activeCount: number
  completedCount: number

  // State helpers
  isEmpty: boolean // isSuccess && tasks.length === 0
  hasTasks: boolean // isSuccess && tasks.length > 0

  // React Query states
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  error: Error | null
  refetch: () => void
}
```

### useTasks Examples

#### Basic Fetching

```tsx
import { useTasks } from '@/features/tasks/hooks/useTasks'

function TaskList() {
  const { tasks, isLoading, isError, error } = useTasks()

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <ErrorState error={error} />

  return (
    <ul>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
```

#### With Filtering

```tsx
function ActiveTasks() {
  const { tasks, activeCount } = useTasks({
    filters: { status: 'active' },
  })

  return (
    <div>
      <h2>Active Tasks ({activeCount})</h2>
      <TaskList tasks={tasks} />
    </div>
  )
}
```

#### With Sorting

```tsx
function TasksByPriority() {
  const { tasks } = useTasks({
    sort: { field: 'priority', direction: 'desc' },
  })

  return <TaskList tasks={tasks} />
}
```

#### Dynamic Filters and Sort

```tsx
function FilterableTaskList() {
  const [status, setStatus] = useState<TaskStatus>('all')
  const [sortField, setSortField] = useState<TaskSortField>('createdAt')

  const { tasks, totalCount, activeCount, completedCount, isEmpty } = useTasks({
    filters: { status },
    sort: { field: sortField, direction: 'desc' },
  })

  if (isEmpty) return <EmptyState />

  return (
    <div>
      <StatusTabs
        status={status}
        onChange={setStatus}
        counts={{
          total: totalCount,
          active: activeCount,
          completed: completedCount,
        }}
      />
      <SortMenu value={sortField} onChange={setSortField} />
      <TaskList tasks={tasks} />
    </div>
  )
}
```

---

## useTaskActions

**Location**: `src/features/tasks/hooks/useTaskActions.ts`

React Query mutation hook for task CRUD operations with optimistic updates and automatic rollback.

### useTaskActions Features

- ✅ **Optimistic Updates** - UI updates instantly before server response
- ✅ **Automatic Rollback** - Reverts changes on error
- ✅ **Snackbar Feedback** - Success/error notifications automatically
- ✅ **Cache Invalidation** - Automatically refetches after mutations
- ✅ **Per-Item Loading States** - Track loading state for individual tasks

### useTaskActions API

```typescript
interface UseTaskActionsReturn {
  // Mutation functions (fire and forget)
  createTask: (data: TaskDraft) => void
  updateTask: (id: string, data: TaskUpdate) => void
  deleteTask: (id: string) => void
  toggleComplete: (id: string, completed: boolean) => void

  // Async versions (for promise-based workflows)
  createTaskAsync: (data: TaskDraft) => Promise<Task>
  updateTaskAsync: (args: { id: string; data: TaskUpdate }) => Promise<Task>
  deleteTaskAsync: (id: string) => Promise<void>

  // Global loading states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Per-item loading states
  isTaskUpdating: (id: string) => boolean
  isTaskDeleting: (id: string) => boolean
}
```

### useTaskActions Examples

#### Basic CRUD Operations

```tsx
import { useTaskActions } from '@/features/tasks/hooks/useTaskActions'

function TaskManager() {
  const { createTask, updateTask, deleteTask, toggleComplete } =
    useTaskActions()

  const handleCreate = () => {
    createTask({
      title: 'New Task',
      description: 'Task description',
      priority: 'medium',
    })
    // Snackbar shows: "Task 'New Task' created"
  }

  const handleUpdate = (id: string) => {
    updateTask(id, { title: 'Updated Title' })
    // Snackbar shows: "Task 'Updated Title' updated"
  }

  const handleDelete = (id: string) => {
    deleteTask(id)
    // Snackbar shows: "Task deleted"
  }

  const handleToggle = (id: string, completed: boolean) => {
    toggleComplete(id, completed)
    // Optimistically updates UI, rolls back on error
  }

  return <TaskForm onSubmit={handleCreate} />
}
```

#### With Loading States

```tsx
function TaskItem({ task }: { task: Task }) {
  const { deleteTask, isTaskDeleting, toggleComplete, isTaskUpdating } =
    useTaskActions()

  const isDeleting = isTaskDeleting(task.id)
  const isUpdating = isTaskUpdating(task.id)

  return (
    <div>
      <Checkbox
        checked={task.completed}
        onChange={e => toggleComplete(task.id, e.target.checked)}
        disabled={isUpdating}
      />
      <span>{task.title}</span>
      <IconButton onClick={() => deleteTask(task.id)} disabled={isDeleting}>
        {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
      </IconButton>
    </div>
  )
}
```

#### Async/Await Pattern

```tsx
function TaskFormDialog() {
  const { createTaskAsync, isCreating } = useTaskActions()
  const [open, setOpen] = useState(true)

  const handleSubmit = async (values: TaskDraft) => {
    try {
      const newTask = await createTaskAsync(values)
      // Task created successfully
      setOpen(false)
      console.log('Created task:', newTask)
    } catch (error) {
      // Error handled automatically by mutation (snackbar shown)
      // Keep dialog open for retry
    }
  }

  return (
    <Dialog open={open}>
      <TaskForm onSubmit={handleSubmit} isSubmitting={isCreating} />
    </Dialog>
  )
}
```

#### Optimistic Update Example

```tsx
function QuickCompleteButton({ task }: { task: Task }) {
  const { toggleComplete } = useTaskActions()

  // UI updates instantly, then syncs with server
  // Automatically rolls back if server request fails
  return (
    <Button onClick={() => toggleComplete(task.id, !task.completed)}>
      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
    </Button>
  )
}
```

### Query Key Management

The hook uses a centralized query key factory to ensure cache invalidation works correctly:

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}
```

---

## useSnackbar

**Location**: `src/shared/hooks/useSnackbar.ts`

Type-safe notification hook wrapping `notistack`, providing a unified user feedback interface.

### useSnackbar Features

- ✅ **Type Safety** - Full TypeScript type definitions
- ✅ **Multiple Variants** - success, error, warning, info, default notification types
- ✅ **Flexible Configuration** - Custom duration, prevent duplicates, custom actions
- ✅ **Global Control** - close and closeAll methods
- ✅ **Clean API** - Semantic method names, easy to use

### useSnackbar API

#### Method List

| Method                           | Purpose         | Default Duration | Color  |
| -------------------------------- | --------------- | ---------------- | ------ |
| `showSuccess(message, options?)` | Success message | 4 seconds        | Green  |
| `showError(message, options?)`   | Error message   | 6 seconds        | Red    |
| `showWarning(message, options?)` | Warning message | 4 seconds        | Orange |
| `showInfo(message, options?)`    | Info message    | 4 seconds        | Blue   |
| `show(message, options?)`        | Default message | 4 seconds        | Gray   |
| `close(key)`                     | Close specific  | -                | -      |
| `closeAll()`                     | Close all       | -                | -      |

#### Configuration Options

```typescript
interface SnackbarOptions {
  autoHideDuration?: number // Auto-hide duration (milliseconds)
  preventDuplicate?: boolean // Prevent duplicate messages (default: false)
  persist?: boolean // Persist until manually closed (default: false)
  action?: React.ReactNode // Custom action button
  anchorOrigin?: {
    // Display position
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}
```

### useSnackbar Examples

#### Basic Usage

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar()

  const handleSave = async () => {
    try {
      await saveTask()
      showSuccess('Task saved successfully')
    } catch (error) {
      showError('Failed to save task, please retry')
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

#### Combined with React Query

```tsx
import { useMutation } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskForm() {
  const { showSuccess, showError } = useSnackbar()

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: api.createTask,
    onSuccess: task => showSuccess(`Task "${task.title}" created`),
    onError: error => showError(error.message || 'Operation failed'),
  })

  const handleSubmit = (values: TaskInput) => {
    createTask(values)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### Custom Configuration

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function AdvancedExample() {
  const { showWarning, close } = useSnackbar()

  const handleWarning = () => {
    const key = showWarning('This action cannot be undone', {
      autoHideDuration: 8000, // Show for 8 seconds
      preventDuplicate: true, // Prevent duplicate display
      action: <Button onClick={() => close(key)}>Got it</Button>,
    })
  }

  return <button onClick={handleWarning}>Show Warning</button>
}
```

#### Persistent Notification

```tsx
import { useState } from 'react'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function PersistentNotification() {
  const { show, close } = useSnackbar()
  const [notificationKey, setNotificationKey] = useState<string | null>(null)

  const showPersistent = () => {
    const key = show('Processing, please wait...', {
      persist: true, // Persist until manually closed
    })
    setNotificationKey(key)
  }

  const hidePersistent = () => {
    if (notificationKey) {
      close(notificationKey)
      setNotificationKey(null)
    }
  }

  return (
    <div>
      <button onClick={showPersistent}>Show Persistent</button>
      <button onClick={hidePersistent}>Close</button>
    </div>
  )
}
```

#### Batch Operation Feedback

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function BulkActions() {
  const { showSuccess, showError, showInfo } = useSnackbar()

  const handleBulkDelete = async (ids: string[]) => {
    showInfo(`Deleting ${ids.length} tasks...`)

    try {
      await api.bulkDelete(ids)
      showSuccess(`Successfully deleted ${ids.length} tasks`)
    } catch (error) {
      showError('Bulk delete failed, please retry')
    }
  }

  return (
    <button onClick={() => handleBulkDelete(selectedIds)}>Bulk Delete</button>
  )
}
```

### Global Configuration

#### Provider Configuration

Configure global defaults in the root component:

```tsx
// src/shared/ui/SnackbarProvider.tsx
import { SnackbarProvider as NotistackProvider } from 'notistack'

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <NotistackProvider
      maxSnack={3} // Max 3 notifications at once
      autoHideDuration={4000} // Default 4 seconds
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      preventDuplicate // Global duplicate prevention
    >
      {children}
    </NotistackProvider>
  )
}
```

### Best Practices

1. **Choose appropriate notification types**

   ```tsx
   showSuccess('Save successful') // Operation success
   showError('Network connection failed') // Error message
   showWarning('About to expire') // Warning info
   showInfo('Syncing data...') // General info
   ```

2. **Error notifications can be shown longer**

   ```tsx
   showError('Operation failed', { autoHideDuration: 6000 })
   ```

3. **Prevent duplicate notifications**

   ```tsx
   showSuccess('Added to favorites', { preventDuplicate: true })
   ```

4. **Provide action buttons for better interaction**

   ```tsx
   showWarning('Cannot be undone after deletion', {
     action: <Button onClick={handleUndo}>Undo</Button>,
   })
   ```

5. **Automate feedback with React Query**

   ```tsx
   useMutation({
     onSuccess: () => showSuccess('Operation success'),
     onError: err => showError(err.message),
   })
   ```

---

## Combined Usage Example

### Complete CRUD with React Query & Snackbar

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskManager() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  // Fetch Tasks
  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.fetchTasks,
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: task => {
      showSuccess(`Task "${task.title}" created`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => showError('Failed to create task'),
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      showSuccess('Task deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => showError('Failed to delete task'),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorPage />

  return (
    <div>
      <TaskList tasks={tasks} onDelete={id => deleteMutation.mutate(id)} />
      <CreateTaskButton
        onCreate={values => createMutation.mutate(values)}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
```

---

## Related Resources

- [React Hooks Official Documentation](https://react.dev/reference/react)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [notistack Documentation](https://notistack.com/)
- [Discriminated Union Types](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
