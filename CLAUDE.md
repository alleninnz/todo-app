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
- ✅ Error handling: `AppErrorBoundary`, `ErrorPage`, error utilities in `shared/lib/error.ts`
- ✅ Test infrastructure: Vitest + MSW + React Testing Library configured
- ✅ Test coverage: 426 tests across 15 files (all passing)
- ✅ Theme: MUI theme in `shared/config/theme.ts`
- ✅ UI components: ErrorBoundary, Layout, SnackbarProvider, LoadingSkeleton

**Key Achievements:**

- httpClient handles **automatic camelCase/snake_case conversion** - no manual mapping needed
- useAsyncState provides **race condition protection** and optimistic updates
- Complete type safety with discriminated unions
- Comprehensive error handling with user-friendly error pages
- High-quality test suite with **no redundant tests** (quality over quantity)
- CSS processing disabled in tests to avoid jsdom parsing issues

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

### Error Handling Patterns

> 📖 **Detailed Guide**: [Error Handling Patterns](docs/patterns.md#error-handling-patterns)

**Key Principles:**

- **AppErrorBoundary**: Wraps app/components to catch React errors.
- **ErrorPage**: Displays router errors.
- **Error Utilities**: `getErrorInfo`, `isNetworkError` in `shared/lib/error.ts`.
- **ApiError**: Structured error class for HTTP requests.

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

> 📖 **Detailed Templates**: [Code Templates & Patterns](docs/patterns.md#code-templates)

Available templates in `docs/patterns.md`:

- **Service Template**: Standard CRUD operations with `httpClient`.
- **Store Template**: Zustand store with sync actions and state interface.
- **Hook Template**: `useAsyncState` integration with service and store.

## 🎨 UI Component Patterns

> 📖 **Detailed Patterns**: [UI Component Patterns](docs/patterns.md#ui-component-patterns)

- **Loading States**: Use `LoadingSkeleton` or `ErrorState`.
- **Forms**: Use `react-hook-form` with `zodResolver`.

## 🧪 Testing Guidelines

> 📖 **Detailed Guide**: [Testing Guidelines](docs/testing-guide.md)

**Key Principles:**

- **Stack**: Vitest + React Testing Library + MSW.
- **Quality**: Avoid redundant tests. Test unique behaviors.
- **Environment**: Tests run in `jsdom` with `import.meta.env.DEV === true`.
- **Structure**: Co-locate tests in `__tests__` directories.

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

> 📖 **Detailed Guide**: [Styling Strategy & Best Practices](docs/styling-guide.md)

**Philosophy**: Hybrid approach using **MUI v7** (components/theme) + **Tailwind v4** (layout).

**Decision Matrix:**

| Scenario                            | Tool           |
| ----------------------------------- | -------------- |
| Layout (flex, grid, padding)        | Tailwind       |
| Component Visuals (colors, shadows) | MUI `sx` prop  |
| Reusable Variants                   | MUI `styled()` |
| Global Defaults                     | MUI Theme      |

## 📝 Maintenance Notes

**When to Update This Doc:**

- Phase completion (update status markers)
- Architecture changes (update principles)
- New patterns introduced (add to templates)
- Breaking changes (update pitfalls)

**Last Updated**: November 26, 2025  
**Current Phase**: B (Task Feature - In Progress)  
**Test Coverage**: 426 tests across 15 files (all passing)  
**Next Milestone**: Complete TaskList + TaskForm components

---

**For more details**: Read `docs/implementation-spec.md` for detailed phase instructions.
