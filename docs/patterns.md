# Code Templates & Patterns

## Code Templates

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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'
import { taskService } from '../services/task.service'
import type { TaskDraft, Task } from '@shared/types/task.types'

export const useTaskActions = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  const createMutation = useMutation({
    mutationFn: (draft: TaskDraft) => taskService.createTask(draft),
    onSuccess: newTask => {
      showSuccess(`Created "${newTask.title}"`)
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Or update cache directly (optimistic update pattern is different, this is simple cache update)
      queryClient.setQueryData<Task[]>(['tasks'], old =>
        old ? [...old, newTask] : [newTask]
      )
    },
    onError: () => {
      showError('Failed to create task')
    },
  })

  return {
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
```

## UI Component Patterns

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

The `ApiError` class provides structured error information:

```typescript
import { ApiError } from '@shared/api/httpClient'

try {
  await httpClient.get('tasks')
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status) // HTTP status code
    console.log(error.statusText) // HTTP status text
    console.log(error.message) // Error message
    console.log(error.url) // Request URL
    console.log(error.data) // Parsed response data
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
