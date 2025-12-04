# Testing Guidelines

## Test Structure

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

## MSW Handlers

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

## Test Quality Best Practices

**Principle: Quality over Quantity** - Avoid redundant tests that don't add value.

### Identifying Redundant Tests

**❌ WRONG - Multiple tests with identical assertions:**

```typescript
// All these tests check the same thing!
it('displays success notification', async () => {
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.getByText('Test notification')).toBeInTheDocument()
  })
})

it('displays error notification', async () => {
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.getByText('Test notification')).toBeInTheDocument() // Same!
  })
})

it('displays warning notification', async () => {
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.getByText('Test notification')).toBeInTheDocument() // Same!
  })
})
```

**✅ CORRECT - Single test or variant-specific assertions:**

```typescript
// Option 1: Single generic test
it('displays notification when triggered', async () => {
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.getByText('Test notification')).toBeInTheDocument()
  })
})

// Option 2: Test variant-specific behavior
it('displays success notification with checkmark icon', async () => {
  fireEvent.click(successButton)
  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument() // Variant-specific!
  })
})
```

### Test Assertion Best Practices

**Each test should verify unique behavior:**

```typescript
// ✅ CORRECT - Each test has a unique purpose
describe('TaskForm', () => {
  it('validates required fields', async () => {
    fireEvent.submit(form)
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    fireEvent.change(titleInput, { target: { value: 'New Task' } })
    fireEvent.submit(form)
    expect(mockSubmit).toHaveBeenCalledWith({ title: 'New Task' })
  })

  it('disables submit button while loading', async () => {
    fireEvent.submit(form)
    expect(submitButton).toBeDisabled()
  })
})
```

### Development vs Production Mode Testing

**Tests run in development mode** (`import.meta.env.DEV === true`):

```typescript
// ✅ CORRECT - Test dev mode behavior
it('shows error details in development mode', () => {
  const error = new Error('Custom error message')
  render(<AppErrorBoundary><ThrowError error={error} /></AppErrorBoundary>)

  // Error details are shown in dev mode (where tests run)
  expect(screen.getByText('Custom error message')).toBeInTheDocument()
})

// ❌ WRONG - Don't use if/else for dev/prod
it('shows/hides error details', () => {
  if (import.meta.env.DEV) {
    // This branch always runs in tests
  } else {
    // This branch never runs in tests
  }
})
```

## Common Test Patterns

### Testing React Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@test/utils' // Wrapper with QueryClientProvider
import { useTaskActions } from '../hooks/useTaskActions'

it('creates task successfully', async () => {
  const { result } = renderHook(() => useTaskActions(), {
    wrapper: createWrapper(),
  })
  const mockTask = { title: 'New Task' }

  await result.current.createTask(mockTask)

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })
})
```

### Testing Error Boundaries

```typescript
import { render, screen } from '@testing-library/react'
import { AppErrorBoundary } from '@shared/ui/AppErrorBoundary'

// Component that throws an error
const ThrowError = ({ error }: { error?: Error }) => {
  throw error || new Error('Test error')
}

it('catches and displays errors', () => {
  render(
    <AppErrorBoundary>
      <ThrowError />
    </AppErrorBoundary>
  )

  expect(screen.getByText('500')).toBeInTheDocument()
  expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
})

it('displays custom error message in dev mode', () => {
  const customError = new Error('Custom error message')

  render(
    <AppErrorBoundary>
      <ThrowError error={customError} />
    </AppErrorBoundary>
  )

  // Custom message visible in development mode
  expect(screen.getByText('Custom error message')).toBeInTheDocument()
})
```

### Testing with MSW

```typescript
import { server } from '@test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles API errors gracefully', async () => {
  // Override handler for this test
  server.use(
    http.get('/tasks', () => {
      return HttpResponse.json({ message: 'Server error' }, { status: 500 })
    })
  )

  const { result } = renderHook(() => useTaskActions())

  await act(async () => {
    await result.current.loadTasks()
  })

  expect(result.current.error).toBeTruthy()
})
```

## Test File Organization

```text
src/
├── features/
│   └── tasks/
│       ├── services/
│       │   └── __tests__/
│       │       └── task.service.test.ts
│       ├── store/
│       │   └── __tests__/
│       │       └── tasks.store.test.ts
│       ├── hooks/
│       │   └── __tests__/
│       │       └── useTaskActions.test.tsx
│       └── validation/
│           └── __tests__/
│               └── task.schema.test.ts
├── shared/
│   ├── api/
│   │   └── __tests__/
│   │       └── httpClient.test.ts
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useSnackbar.test.tsx
│   ├── lib/
│   │   └── __tests__/
│   │       ├── error.test.ts
│   │       ├── date.test.ts
│   │       └── format.test.ts
│   └── ui/
│       └── __tests__/
│           ├── AppErrorBoundary.test.tsx
│           ├── ErrorPage.test.tsx
│           └── LoadingSkeleton.test.tsx
└── test/
    ├── mocks/
    │   ├── handlers.ts         # MSW request handlers
    │   └── server.ts           # MSW server setup
    ├── setup-env.ts            # Test environment setup
    └── setup.ts                # MSW lifecycle hooks
```

## Test Infrastructure

**Vitest Configuration** (`vite.config.ts`):

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['src/test/setup-env.ts', 'src/test/setup.ts'],
  css: false, // Disable CSS processing to avoid jsdom parsing errors
}
```

**Key Features:**

- ✅ **jsdom environment** - DOM testing without a browser
- ✅ **MSW (Mock Service Worker)** - API mocking
- ✅ **CSS disabled** - Avoids jsdom CSS parsing warnings
- ✅ **Global test utilities** - `describe`, `it`, `expect` available everywhere
- ✅ **Automatic cleanup** - React Testing Library cleanup after each test
