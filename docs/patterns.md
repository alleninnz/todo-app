# Code Templates & Patterns

## Code Templates

### Service Template (Real Implementation)

**Location**: `src/features/tasks/services/task.service.ts`

This is the actual implementation used in the project for task API operations:

```typescript
import { httpClient } from '@/shared/api/httpClient'
import type { Task, TaskDraft, TaskUpdate } from '@/shared/types/task.types'

const BASE_URL = 'tasks'

/**
 * Service for managing task-related API interactions.
 * Handles CRUD operations for tasks using the configured HTTP client.
 */
export const taskService = {
  /**
   * Fetches all tasks.
   * @returns Promise resolving to an array of Task objects.
   */
  getAll: async (): Promise<Task[]> => {
    return httpClient.get<Task[]>(BASE_URL)
  },

  /**
   * Fetches a single task by ID.
   * @param id - The unique identifier of the task.
   * @returns Promise resolving to a Task object.
   */
  getById: async (id: string): Promise<Task> => {
    return httpClient.get<Task>(`${BASE_URL}/${id}`)
  },

  /**
   * Creates a new task.
   * @param data - The task creation payload (TaskDraft).
   * @returns Promise resolving to the created Task object.
   */
  create: async (data: TaskDraft): Promise<Task> => {
    return httpClient.post<Task>(BASE_URL, { json: data })
  },

  /**
   * Updates an existing task.
   * @param id - The unique identifier of the task to update.
   * @param data - The task update payload (TaskUpdate).
   * @returns Promise resolving to the updated Task object.
   */
  update: async (id: string, data: TaskUpdate): Promise<Task> => {
    return httpClient.patch<Task>(`${BASE_URL}/${id}`, { json: data })
  },

  /**
   * Deletes a task.
   * @param id - The unique identifier of the task to delete.
   * @returns Promise resolving when the deletion is complete.
   */
  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`${BASE_URL}/${id}`)
  },
}
```

**Key Features:**

- JSDoc comments for API documentation
- Type-safe with TypeScript generics
- Uses centralized httpClient with automatic camelCase/snake_case conversion
- Returns typed promises for better IDE support
- Follows RESTful conventions (GET, POST, PATCH, DELETE)

### React Query Hook Template (Real Implementation)

**Location**: `src/features/tasks/hooks/useTasks.ts`

This is a simplified version of the actual implementation showing the query pattern:

```typescript
import { useMemo } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { taskService } from '../services/task.service'
import {
  type Task,
  type TaskFilters,
  type TaskSortOption,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  PRIORITY_ORDER,
} from '@/shared/types'
import { parseDateString } from '@/shared/lib/date'

interface UseTasksOptions {
  filters?: TaskFilters
  sort?: TaskSortOption
  enabled?: boolean
  staleTime?: number
}

interface UseTasksResult extends Omit<UseQueryResult<Task[], Error>, 'data'> {
  tasks: Task[]
  allTasks: Task[] | undefined
  totalCount: number
  activeCount: number
  completedCount: number
  isEmpty: boolean
  hasTasks: boolean
}

export const useTasks = ({
  filters = DEFAULT_FILTERS,
  sort = DEFAULT_SORT,
  enabled = true,
  staleTime = 30 * 1000, // 30 seconds
}: UseTasksOptions = {}): UseTasksResult => {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
    enabled,
    staleTime,
  })

  // Client-side filtering and sorting with useMemo
  const tasks = useMemo(() => {
    if (!query.data) return []
    let result = [...query.data]

    // Apply filters
    if (filters.status !== 'all') {
      const isCompleted = filters.status === 'completed'
      result = result.filter(task => task.completed === isCompleted)
    }
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sort.field) {
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          break
        case 'dueDate':
          // Tasks without due date go last
          if (!a.dueDate && b.dueDate) return 1
          if (a.dueDate && !b.dueDate) return -1
          const dateA = a.dueDate
            ? (parseDateString(a.dueDate)?.getTime() ?? 0)
            : 0
          const dateB = b.dueDate
            ? (parseDateString(b.dueDate)?.getTime() ?? 0)
            : 0
          comparison = dateA - dateB
          break
        case 'createdAt':
          const createdA = parseDateString(a.createdAt)?.getTime() ?? 0
          const createdB = parseDateString(b.createdAt)?.getTime() ?? 0
          comparison = createdA - createdB
          break
      }
      return sort.direction === 'asc' ? comparison : -comparison
    })

    return result
  }, [query.data, filters, sort])

  // Calculate counts from raw data
  const { totalCount, activeCount, completedCount } = useMemo(() => {
    if (!query.data) return { totalCount: 0, activeCount: 0, completedCount: 0 }
    let active = 0,
      completed = 0
    for (const task of query.data) {
      if (task.completed) completed++
      else active++
    }
    return {
      totalCount: query.data.length,
      activeCount: active,
      completedCount: completed,
    }
  }, [query.data])

  return {
    ...query,
    tasks,
    allTasks: query.data,
    totalCount,
    activeCount,
    completedCount,
    isEmpty: query.isSuccess && tasks.length === 0,
    hasTasks: query.isSuccess && tasks.length > 0,
  }
}
```

**Key Features:**

- Client-side filtering and sorting with useMemo for performance
- Derived counts calculated from raw data
- Type-safe with comprehensive TypeScript interfaces
- Configurable caching with staleTime parameter
- Helper properties (isEmpty, hasTasks) for UI states

### Mutation Hook Template (Real Implementation)

**Location**: `src/features/tasks/hooks/useTaskActions.ts`

This shows the actual optimistic update pattern used in the project:

```typescript
import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import { taskService } from '../services'
import type { Task, TaskUpdate, TaskDraft } from '@/shared/types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

interface CreateMutationContext {
  previousTasks: Task[] | undefined
}

export const useTaskActions = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  const invalidateTasks = useCallback(
    () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    [queryClient]
  )

  const createMutation = useMutation<
    Task,
    Error,
    TaskDraft,
    CreateMutationContext
  >({
    mutationFn: taskService.create,
    onMutate: async newTask => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      const optimisticTask = {
        ...newTask,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Task

      queryClient.setQueryData<Task[]>(taskKeys.all, old =>
        old ? [...old, optimisticTask] : [optimisticTask]
      )

      return { previousTasks }
    },
    onError: (_err, _var, context) => {
      if (context?.previousTasks === undefined) {
        queryClient.removeQueries({ queryKey: taskKeys.all })
      } else {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      showError('Failed to create task')
    },
    onSuccess: data => showSuccess(`Task "${data.title}" created`),
    onSettled: invalidateTasks,
  })

  // Stable callback wrappers
  const createTask = useCallback(
    (data: TaskDraft) => createMutation.mutate(data),
    [createMutation]
  )

  // Per-item loading state helpers
  const isTaskUpdating = useCallback(
    (id: string) =>
      updateMutation.isPending && updateMutation.variables?.id === id,
    [updateMutation.isPending, updateMutation.variables]
  )

  return {
    createTask,
    createTaskAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isTaskUpdating, // Per-item loading states
    // ... other mutations (update, delete, toggle)
  }
}
```

**Key Features:**

- Optimistic updates with automatic rollback on error
- Type-safe mutation contexts for rollback data
- Stable callbacks using useCallback for performance
- Per-item loading states for granular UI control
- Centralized query key factory pattern
- Integrated snackbar notifications

### Store Template (Zustand)

```typescript
// features/tasks/store/tasks.store.ts
import { create } from 'zustand'

interface TasksStore {
  // UI State (not server state - React Query handles that)
  selectedTaskId: string | null
  isFormOpen: boolean

  // Actions
  setSelectedTaskId: (id: string | null) => void
  openForm: () => void
  closeForm: () => void
}

export const useTasksStore = create<TasksStore>(set => ({
  selectedTaskId: null,
  isFormOpen: false,

  setSelectedTaskId: id => set({ selectedTaskId: id }),
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false, selectedTaskId: null }),
}))
```

## UI Component Patterns

### Loading States

```typescript
function TaskList() {
  const { tasks, isLoading, isError, error, isEmpty } = useTasks()

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <ErrorState error={error} onRetry={refetch} />
  if (isEmpty) return <EmptyState />

  return (
    <ul>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
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

  const { createTask } = useTaskActions()

  const onSubmit = (data: TaskDraft) => createTask(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('title')}
        label="Title"
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <TextField
        {...register('description')}
        label="Description"
        multiline
        rows={4}
      />
      <Button type="submit">Create Task</Button>
    </form>
  )
}
```

## Error Handling Patterns

**Comprehensive error handling infrastructure for consistent user experience:**

### Error Boundary Usage

Wrap components with `AppErrorBoundary` to catch React errors:

```typescript
import { AppErrorBoundary } from '@shared/ui/AppErrorBoundary'

// Basic usage
<AppErrorBoundary>
  <YourComponent />
</AppErrorBoundary>

// With error logging
<AppErrorBoundary
  onError={(error, errorInfo) => {
    logErrorToService(error, errorInfo.componentStack)
  }}
>
  <TasksPage />
</AppErrorBoundary>

// With custom fallback
<AppErrorBoundary fallback={<CustomErrorPage />}>
  <App />
</AppErrorBoundary>
```

**Features:**

- ✅ Automatic error recovery actions (Try Again, Reload Page, Go Home)
- ✅ Context-aware recovery based on error category (network, auth, client, server)
- ✅ Development mode error details (stack trace, component stack)
- ✅ Production-safe (hides technical details from users)

### Error Page Components

Use `ErrorPage` for router errors and `ErrorPageUI` for custom error displays:

```typescript
import { ErrorPage, ErrorPageUI } from '@shared/ui/ErrorPage'

// Router error boundary
<Route
  path="/"
  errorElement={<ErrorPage />}
  element={<App />}
/>

// Custom error display
<ErrorPageUI
  statusCode={404}
  errorInfo={{
    title: 'Page Not Found',
    message: "The page you're looking for doesn't exist.",
    category: 'client'
  }}
  onGoBack={() => navigate(-1)}
  onGoHome={() => navigate('/')}
/>
```

### Error Utility Functions

Use error utilities from `shared/lib/error.ts`:

```typescript
import {
  getErrorInfo,
  isNetworkError,
  extractStatusCode,
  HTTP_ERROR_MESSAGES,
  NETWORK_ERROR_INFO,
  COMPONENT_ERROR_INFO,
} from '@shared/lib/error'

// Get appropriate error message and status code
const { statusCode, errorInfo } = getErrorInfo(error)
// Returns: { statusCode: 404, errorInfo: { title: 'Page Not Found', message: '...', category: 'client' } }

// Check if error is network-related
if (isNetworkError(error)) {
  showError('Please check your internet connection')
}

// Extract HTTP status code from various error types
const status = extractStatusCode(error) // Handles error.status, error.statusCode, error.response.status, etc.
```

**Error Categories:**

- `'client'` - 4xx errors (bad request, not found)
- `'server'` - 5xx errors (internal server error, service unavailable)
- `'network'` - Connection failures, timeouts
- `'auth'` - 401/403 authentication/authorization errors
- `'unknown'` - Runtime errors without clear HTTP status

### Custom Error Types

The `ApiError` class from httpClient provides structured error information:

```typescript
import { httpClient } from '@shared/api/httpClient'

try {
  await httpClient.get('tasks')
} catch (error) {
  if (error instanceof Error && 'status' in error) {
    const apiError = error as any // ApiError is exported from httpClient
    console.log(apiError.status) // HTTP status code
    console.log(apiError.statusText) // HTTP status text
    console.log(apiError.message) // Error message
    console.log(apiError.url) // Request URL
    console.log(apiError.data) // Parsed response data (camelCase)
  }
}
```

**httpClient automatically converts HTTPError to ApiError** with camelCase data.

### Error Recovery Actions

`AppErrorBoundary` provides context-aware recovery actions:

```typescript
// Network errors: Retry + Reload
category: 'network' → ['Retry', 'Reload Page']

// Auth errors: Try Again + Go Home (to re-authenticate)
category: 'auth' → ['Try Again', 'Go Home']

// Client/Server/Unknown errors: Try Again + Reload
category: 'client' | 'server' | 'unknown' → ['Try Again', 'Reload Page']
```

**Custom recovery actions:**

```typescript
<ErrorPageUI
  statusCode={500}
  errorInfo={errorInfo}
  customActions={[
    { label: 'Retry', onClick: handleRetry, variant: 'outlined' },
    { label: 'Contact Support', onClick: handleSupport, variant: 'contained' }
  ]}
/>
```

### React Query Error Handling

```typescript
// Global error handler in QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (extractStatusCode(error) && extractStatusCode(error)! < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})

// Component-level error handling
function TaskList() {
  const { tasks, isError, error, refetch } = useTasks()

  if (isError) {
    const { statusCode, errorInfo } = getErrorInfo(error)

    return (
      <ErrorPageUI
        statusCode={statusCode}
        errorInfo={errorInfo}
        customActions={[
          { label: 'Retry', onClick: refetch, variant: 'contained' }
        ]}
      />
    )
  }

  return <List tasks={tasks} />
}
```

## Best Practices

### 1. State Management

- **Server State**: Use React Query for all API data
- **Client State**: Use Zustand for UI state (modals, selections)
- **Form State**: Use React Hook Form for forms
- **URL State**: Use React Router for shareable state (future)

### 2. Component Organization

```typescript
// ✅ Good: Co-located tests and clear separation
features / tasks / components / TaskList.tsx
__tests__ / TaskList.test.tsx
hooks / useTasks.ts
__tests__ / useTasks.test.tsx
services / task.service.ts
__tests__ / task.service.test.ts
```

### 3. Type Safety

```typescript
// ✅ Good: Strict types, no any
interface TaskItemProps {
  task: Task
  onDelete: (id: string) => void
  onToggle: (id: string, completed: boolean) => void
}

// ❌ Bad: Using any
function TaskItem({ task, onDelete }: any) {}
```

### 4. Error Messages

```typescript
// ✅ Good: User-friendly messages
showError('Failed to create task. Please try again.')

// ❌ Bad: Technical jargon
showError('POST /api/tasks returned 500 Internal Server Error')
```

### 5. Loading States

```typescript
// ✅ Good: Per-item loading states
function TaskItem({ task }: { task: Task }) {
  const { deleteTask, isTaskDeleting } = useTaskActions()
  const isDeleting = isTaskDeleting(task.id)

  return (
    <IconButton
      onClick={() => deleteTask(task.id)}
      disabled={isDeleting}
    >
      {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
    </IconButton>
  )
}

// ❌ Bad: Global loading state for granular operations
function TaskItem({ task, isDeleting }: { task: Task, isDeleting: boolean }) {
  // All tasks show loading, not just the one being deleted
}
```

### 6. Optimistic Updates

```typescript
// ✅ Good: Optimistic updates with rollback
const createMutation = useMutation({
  mutationFn: taskService.create,
  onMutate: async newTask => {
    // Cancel queries and snapshot
    await queryClient.cancelQueries({ queryKey: ['tasks'] })
    const previous = queryClient.getQueryData(['tasks'])

    // Optimistically update
    queryClient.setQueryData(['tasks'], old => [...old, newTask])

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks'], context.previous)
    showError('Failed to create task')
  },
})
```

### 7. Query Key Management

```typescript
// ✅ Good: Centralized query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Usage
useQuery({ queryKey: taskKeys.list(filters), ... })
queryClient.invalidateQueries({ queryKey: taskKeys.all })

// ❌ Bad: Hardcoded strings everywhere
useQuery({ queryKey: ['tasks'], ... })
queryClient.invalidateQueries({ queryKey: ['tasks'] })
```
