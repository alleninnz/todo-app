# Todo App MVP Implementation Spec

## 1. Context & Goals

- Deliver the MVP described in `docs/overview.md`: task CRUD, completion toggle, optional deadline/priority/notes, list filters, multi-criteria sorting, and resilient UI states backed by a REST API.
- Uphold repository standards in `AGENTS.md`: feature-first architecture, Material UI primary styling, shared utilities, and colocated tests/stories.
- Produce a cohesive foundation that future feature slices can reuse without refactoring.

## 2. Functional Requirements (What the user can do)

- **Task lifecycle**: Create, edit, delete tasks with required title plus optional description, due date, and priority (`none | low | medium | high`).
- **Status toggle**: Mark tasks complete/incomplete inline.
- **Filtering**: Filter list by status (All, Active, Completed) and by priority (optional extra filter slot for later expansion).
- **Sorting**: Sort tasks by created date (default), due date, or priority; remember last sort order per session.
- **Empty/error/loading states**: Show purpose-built UI for each state within the list area.
- **Persistence**: All operations call the backend via the shared `httpClient` with optimistic updates where practical.
- **Feedback**: Use snackbar notifications for success/error and highlight validation errors inline within forms.

## 3. Non-Functional Requirements

- **Type safety** with shared domain models and Zod schemas for runtime validation.
- **Single source of truth**: Zustand store manages client state; hooks orchestrate async logic; services encapsulate API calls.
- **UI consistency**: Prefer MUI components, use Tailwind utilities strictly for spacing/layout, and rely on the configured theme.
- **Testability**: Unit/integration coverage via Vitest + React Testing Library; Storybook stories for all visual components.
- **Extensibility**: Keep slices isolated and expose public APIs through `index.ts` barrels per feature.

## 4. Target Artifacts (Files to implement)

- **Shared foundation**: `src/shared/api/httpClient.ts`, `src/shared/hooks/useAsyncState.ts`, `src/shared/hooks/useSnackbar.ts`, `src/shared/lib/date.ts`, `src/shared/lib/format.ts`, `src/shared/types/task.types.ts`.
- **Task domain**: Files under `src/features/tasks/**` (types, validation, services, store, hooks, components, public API, tests, stories).
- **Lists feature**: `src/features/lists/**` to control filtering/sorting UI and state.
- **App shell & routing**: `src/shared/ui/AppLayout.tsx`, `src/shared/ui/AppErrorBoundary.tsx`, `src/shared/ui/ErrorPage.tsx`, `src/pages/TasksPage.tsx`, `src/store/index.ts`.
- **Testing & tooling**: `src/test/setup.ts`, targeted `*.test.tsx`, and `*.stories.tsx` colocated with components.

## 5. Implementation Roadmap & Hints

Follow phases sequentially; each step references the files above and includes guidance/snippets.

### Phase A: Shared Foundation

1. **Shared Task Types (`src/shared/types/task.types.ts`)**
   - Define reusable enums/interfaces: `TaskPriority`, `TaskStatus`, `Task`, `TaskDraft`, `TaskDTO`, `TaskFilters`, `TaskSortOption`.
   - Encapsulate mapping helpers (e.g., `PRIORITY_ORDER`) for sorting logic.
   - _Hint_: keep DTO separate from domain for mapper clarity.
   - _Example_:

     ```ts
     export type TaskPriority = 'none' | 'low' | 'medium' | 'high'
     export interface Task {
       id: string
       title: string
       description?: string
       priority: TaskPriority
       completed: boolean
       createdAt: string
       dueDate?: string
     }
     ```

2. **HTTP Client (`src/shared/api/httpClient.ts`)**
   - Instantiate `ky` with base URL, timeout, JSON headers, and error normalization.
   - Surface typed helpers for GET/POST/PATCH/DELETE returning JSON.
   - Add hook support for request logging when `env.VITE_ENABLE_DEBUG` is true.
   - _Example_:

     ```ts
     import ky from 'ky'
     import { env } from '@shared/config/env'

     export const httpClient = ky.create({
       prefixUrl: env.VITE_API_BASE_URL,
       timeout: env.VITE_TIMEOUT,
       hooks: {
         beforeRequest: [
           request => {
             request.headers.set('Accept', 'application/json')
           },
         ],
         afterResponse: [
           (_req, _opts, res) => {
             if (!res.ok) throw new Error('Network error')
           },
         ],
       },
     })
     ```

3. **Snackbar & Async Hooks (`src/shared/hooks`)**
   - `useSnackbar.ts`: wrap `notistack` hook; expose helpers like `showSuccess`, `showError` with sensible defaults.
   - `useAsyncState.ts`: manage `{ status, data, error }` with `execute(asyncFn)` pattern for reuse across hooks.
   - _Hint_: expose discriminated union type for status (`'idle' | 'loading' | 'success' | 'error'`).

4. **Utility Libraries (`src/shared/lib/date.ts`, `format.ts`)**
   - Date helpers: `isOverdue`, `compareByDueDate`, `formatDueDate` using Day.js; return typed comparators for sorting.
   - Formatting helpers: `formatPriority`, `truncateText`, etc. Keep pure and reusable.

5. **Test Bootstrap (`src/test/setup.ts`)**
   - Configure `@testing-library/jest-dom`, `msw`, and global mocks (e.g., `window.matchMedia`).
   - _Snippet_:

     ```ts
     import '@testing-library/jest-dom/vitest'
     import { server } from './mocks/server'

     beforeAll(() => server.listen())
     afterEach(() => server.resetHandlers())
     afterAll(() => server.close())
     ```

### Phase B: Task Domain Logic

1. **Validation Schema (`task.schema.ts`)**
   - Build Zod schema aligning with shared types; integrate default values for optional fields.
   - Export `taskFormResolver = zodResolver(taskFormSchema)` for React Hook Form use.

2. **API Paths (`task.paths.ts`)**
   - Centralize endpoints: `TASKS_BASE_PATH = 'tasks'`; helpers like `taskDetailPath(id)`.

3. **Mapper (`task.mapper.ts`)**
   - Convert API DTO structures to domain `Task`; ensure date strings normalized via `dayjs().toISOString()`.
   - Provide inverse mapping for POST/PATCH payloads.

4. **Service Layer (`task.service.ts`)**
   - Use `httpClient` to implement CRUD: `fetchTasks`, `createTask`, `updateTask`, `deleteTask`, `toggleTask`.
   - Return domain `Task` and leverage mapper for conversions.
   - Support abort signals for list fetching.

5. **Zustand Store (`tasks.store.ts`)**
   - Design slice with state: `items: Task[]`, `isLoading`, `error`, `filters`, `sort`, `selectedTaskId`.
   - Actions: `setTasks`, `addTask`, `updateTask`, `removeTask`, `setFilters`, `setSort`, `setLoading`, `setError`.
   - _Hint_: use `immer`-style mutate or plain immutable updates; Zustand 5 supports `createStore` + selectors.
   - _Example_:

     ```ts
     import { createStore } from 'zustand/vanilla'

     export const tasksStore = createStore<TasksState>(set => ({
       items: [],
       setTasks: tasks => set({ items: tasks }),
       updateTask: task =>
         set(state => ({
           items: state.items.map(it => (it.id === task.id ? task : it)),
         })),
     }))
     ```

6. **Hooks (`useTaskActions.ts`, `useTaskDetail.ts`)**
   - Use `useAsyncState` + `useSnackbar`; connect to Zustand store.
   - `useTaskActions`: expose `loadTasks`, `createTask`, `editTask`, `removeTask`, `toggleComplete`; handle optimistic updates + rollback on error.
   - `useTaskDetail`: derive single task from store; fetch from API if missing.
   - _Hint_: wrap API calls in `try/catch`; map errors to user-friendly messages via snackbar.

7. **UI Components**
   - **`TaskEmptyState.tsx`**: display friendly prompt with CTA button for new task.
   - **`TaskErrorState.tsx`**: show error message + retry callback.
   - **`TaskForm.tsx`**: build form with RHF; use MUI `<Dialog>` for modal usage; include fields: title (`TextField`), description (`TextField multiline`), due date (`DatePicker`), priority (`Select`). Provide controlled submit/cancel actions and integrate `taskFormResolver`.
     - _Snippet_:

       ```tsx
       const { control, handleSubmit } = useForm<TaskFormValues>({
         resolver: taskFormResolver,
         defaultValues,
       })
       ```

   - **`TaskItem.tsx`**: render list item with checkbox, title, metadata chips, action buttons (edit/delete). Accept callbacks from parent.
   - **`TaskList.tsx`**: orchestrate states: loading skeleton, error/empty components, and map tasks to `TaskItem`. Accept filters/sort state to display chips/headings.
   - Ensure all components export named functions and use MUI layout primitives (`Stack`, `Paper`, `List`, etc.).

8. **Public API (`index.ts`)**
   - Re-export components (`TaskList`, `TaskItem`, `TaskForm`, `TaskEmptyState`, `TaskErrorState`), hooks, types, store selectors for consumers.

9. **Stories & Tests**
   - For each component, add `*.stories.tsx` demonstrating states (default, loading skeleton, empty, error) using MSW to mock API.
   - Write vitest suites inside `src/features/tasks/__tests__/` covering store reducer logic, hooks (with MSW), and component behavior.

### Phase C: Lists (Filters & Sorting)

1. **State Hook (`useListFilters.ts`)**
   - Manage local filter/sort state; optionally sync with URL search params later.
   - Provide derived props for UI components and actions to update.

2. **UI Components**
   - **`StatusTabs.tsx`**: MUI `<Tabs>` toggling status filter; expose `onChange` callback.
   - **`FilterBar.tsx`**: Compose status tabs, optional priority chips, text search stub (future-proof spacing).
   - **`SortMenu.tsx`**: MUI `<Menu>` triggered by button; allow selecting sort field and direction.
   - Use Tailwind utilities for spacing wrapper only (e.g., `div` with `flex` + `gap-2`).

3. **Public API (`index.ts`)**
   - Export `useListFilters`, `FilterBar`, `SortMenu`, `StatusTabs` for consumption by pages.

4. **Stories & Tests**
   - Add interaction tests verifying callbacks fire and state updates correctly.

### Phase D: App Shell & Page Composition

1. **Global Layout (`AppLayout.tsx`)**
   - Implement responsive shell: header with app name, main area centered with max width, background diff for body.
   - Use MUI `<Container>`, `<AppBar>`, `<Toolbar>`, `<Box>` plus Tailwind spacing as needed.

2. **Error Boundary (`AppErrorBoundary.tsx`)**
   - Use `react-error-boundary` or manual class to catch errors; render fallback UI with retry button.
   - _Snippet_:

     ```tsx
     return (
       <ErrorBoundary
         FallbackComponent={AppFallback}
         onReset={resetErrorBoundary}
       >
         {children}
       </ErrorBoundary>
     )
     ```

3. **Error Page (`ErrorPage.tsx`)**
   - Reuse MUI components to show status code, message, and link back home.

4. **Tasks Page (`src/pages/TasksPage.tsx`)**
   - Compose `FilterBar`, `SortMenu`, and `TaskList` with `useTaskActions` + `useListFilters` hook.
   - On mount, load tasks if store empty; pass callbacks for create/edit/delete/toggle.
   - Manage form modal state inside page or via `TaskForm` prop composition.

5. **Store Index (`src/store/index.ts`)**
   - Re-export `useTasksStore` hook and any selectors for external use.

6. **Providers & Entry**
   - Ensure `AppProviders` remains up-to-date; validate router element tree renders page with layout.

### Phase E: Quality Gates

1. **Vitest Suites**
   - Cover store logic, hooks, and components with user-centered assertions.
   - Add tests for `useListFilters`, `TaskForm` validation, and API error handling fallback.

2. **Storybook Scenarios**
   - Document major UI pieces; integrate MSW handlers for success/error.
   - Configure `play` functions for critical interactions (e.g., toggling status tabs, submitting form).

3. **Manual QA Checklist**
   - Verify create/edit/delete flows, sorting/filtering combos, snackbar feedback, responsive layout (mobile/tablet/desktop), and error states via network throttling.

## 6. Deliverables Checklist

- [ ] Shared utilities compiled and exported.
- [ ] Task services, store, hooks, and UI implemented with stories/tests.
- [ ] Lists feature delivering filters and sorting UI + logic.
- [ ] Tasks page integrated with layout, error handling, and snackbar feedback.
- [ ] Vitest and Storybook coverage established; `pnpm build`, `pnpm lint`, `pnpm test` (via Vitest) pass.
- [ ] Documentation updates (README if APIs change) and environment expectations clarified.

---

Use this spec as the implementation contract; tackle phases sequentially, committing atomically per logical chunk and keeping UI aligned with the MUI-first guideline. EOF
