# Project Phase Planning

## Phase One: Core (MVP)

The goal is to deliver a minimum viable version covering the following capabilities:

1. Task CRUD: Create / Edit / Delete tasks (title required).
2. Status toggle: Mark completed / uncompleted.
3. Optional due date and priority (none / low / medium / high).
4. Note description field.
5. List view with filters: All / Active / Completed.
6. Sorting: By creation time / due date / priority.
7. Empty state, loading state, error state display.
8. Integration with backend service for data persistence (via Ky HTTP client).

### Phase One Project Structure

```text
├─ .env
├─ .env.example
├─ .gitignore
├─ .prettierrc
├─ .prettierignore
├─ README.md
├─ eslint.config.js
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ index.html
├─ docs/
│  └─ overview.md
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ providers.tsx
│  │  └─ routes.tsx
│  │
│  ├─ features/
│  │  ├─ lists/
│  │  │  ├─ components/
│  │  │  │  ├─ FilterBar.tsx
│  │  │  │  ├─ SortMenu.tsx
│  │  │  │  └─ StatusTabs.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useListFilters.ts
│  │  │  └─ index.ts
│  │  │
│  │  └─ tasks/
│  │     ├─ components/
│  │     │  ├─ TaskEmptyState.tsx
│  │     │  ├─ TaskErrorState.tsx
│  │     │  ├─ TaskForm.tsx
│  │     │  ├─ TaskItem.tsx
│  │     │  └─ TaskList.tsx
│  │     ├─ hooks/
│  │     │  ├─ useTaskActions.ts
│  │     │  ├─ useTaskDetail.ts
│  │     │  └─ useTasks.ts
│  │     ├─ services/
│  │     │  └─ task.service.ts
│  │     ├─ store/
│  │     │  └─ tasks.store.ts
│  │     ├─ validation/
│  │     │  └─ task.schema.ts
│  │     └─ index.ts
│  │
│  ├─ pages/
│  │  └─ TasksPage.tsx
│  │
│  ├─ shared/
│  │  ├─ api/
│  │  │  └─ httpClient.ts
│  │  ├─ assets/
│  │  │  └─ .gitkeep
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  └─ theme.ts
│  │  ├─ hooks/
│  │  │  └─ useSnackbar.ts
│  │  ├─ lib/
│  │  │  ├─ date.ts
│  │  │  ├─ error.ts
│  │  │  └─ format.ts
│  │  ├─ types/
│  │  │  ├─ api.types.ts
│  │  │  ├─ index.ts
│  │  │  └─ task.types.ts
│  │  └─ ui/
│  │     ├─ AppErrorBoundary.tsx
│  │     ├─ AppLayout.tsx
│  │     ├─ ErrorPage.tsx
│  │     ├─ LoadingSkeleton.tsx
│  │     └─ SnackbarProvider.tsx
│  │
│  ├─ store/
│  │  └─ index.ts
│  │
│  ├─ test/
│  │  ├─ mocks/
│  │  │  ├─ browser.ts
│  │  │  ├─ handlers.ts
│  │  │  └─ server.ts
│  │  ├─ setup-env.ts
│  │  └─ setup.ts
│  │
│  ├─ main.tsx
│  └─ vite-env.d.ts
│
└─ .vscode/
   └─ settings.json

```

### Directory and File Description

#### Naming and Layering Conventions

- `.types.ts`: Type declarations only (domain or shared). Must not contain implementation or side effects.
- `.store.ts`: Zustand slice. Only synchronous state and actions, no asynchronous operations.
- `.service.ts`: Business service (HTTP calls, domain transformation orchestration). Not dependent on React.
- `.schema.ts`: Input/form validation structure definition (RHF built-in rules or third-party validator descriptions).
- `.tsx`: Pure UI components and container components. Components do not directly touch HTTP; they uniformly call services through hooks.
- `shared/*`: Cross-domain infrastructure (HTTP client, theme, general hooks, utility functions, shared models, general UI).
- `features/*`: Domain-cohesive implementation (tasks, lists) including components/hooks/services/store/types/validation.

#### Directory and File Purposes

##### Root Directory

- `.env` / `.env.example`: Environment variables (Vite only recognizes variables starting with `VITE_`); `.env.example` guides the team on configuration.
- `README.md`: Project overview, development/build/deployment commands, conventions.
- `docs/overview.md`: Phase objectives, acceptance checklist, subsequent roadmap.
- `public/`: Static resources (copied as-is during build).

##### src/app (Application Shell Layer)

- `App.tsx`: Application root component (thin), only responsible for assembling Providers/routing.
- `index.css`: Global style entry point (Tailwind layers, Reset, variables).
- `providers.tsx`: Unified mounting of global Providers (Theme, Snackbar, ErrorBoundary, Router, etc.). Order is crucial: ErrorBoundary → Theme → QueryClient → Snackbar → Router.
- `routes.tsx`: Route table (lazy loading). Business data should not be written here.

##### src/features/lists (List Filtering and Sorting)

- `components/`: FilterBar.tsx, SortMenu.tsx, StatusTabs.tsx only handle UI and callbacks.
- `hooks/useListFilters.ts`: Centrally manages filtering/sorting state (MVP can use internal state; can bind to URL later).
- `index.ts`: Export public API to form an anti-corruption layer.

##### src/features/tasks (Task Domain)

- `components/`:
  - `TaskForm.tsx`: Create/edit form using react-hook-form (title required; due date/priority/notes optional).
  - `TaskItem.tsx`: Single task UI (completion toggle, edit, delete).
  - `TaskList.tsx`: Task list container (pure rendering + callbacks).
  - `TaskEmptyState.tsx` / `TaskErrorState.tsx`: Three-state components.
- `hooks/`:
  - `useTasks.ts`: Query hook for fetching tasks with React Query, provides filtering and sorting.
  - `useTaskActions.ts`: Encapsulates loading/creating/updating/deleting/toggling completion async business, calls task.service.ts and uses React Query mutations with optimistic updates.
  - `useTaskDetail.ts`: Reads a single task (can read from cache first, request if missing).
- `services/`:
  - `task.service.ts`: Pure function service calling httpClient (not dependent on React), returns unified domain model externally.
- `store/`:
  - `tasks.store.ts`: Zustand slice, stores client-side state like UI preferences (not used for server state - React Query handles that).
- `validation/`:
  - `task.schema.ts`: Form validation structure (Zod schemas for React Hook Form integration).
- `index.ts`: Exports task domain entities allowed for external access (components, hooks, service types), shields internal deep paths.

##### src/pages (Page Container Layer)

- `TasksPage.tsx`: Page assembly (Filter/Sort/Tabs + List + Form), controls three states, triggers loading/changes through useTasks() and useTaskActions().

##### src/shared (Cross-Domain Shared Layer)

- `api/httpClient.ts`: Ky client (unified timeout, retry, authentication, error transformation). The only HTTP instance.
- `config/env.ts`: Reads and validates `import.meta.env` (e.g., VITE_API_BASE_URL), exports env.API_BASE_URL.
- `config/theme.ts`: MUI theme with aligned breakpoints for Tailwind CSS compatibility.
- `hooks/`: useSnackbar.ts (global messages wrapping notistack).
- `lib/`: date.ts (date comparison/sorting key/overdue judgment), format.ts (text/priority/date formatting), error.ts (error categorization and message mapping).
- `types/task.types.ts`: Cross-domain shared domain model Task & Priority (UI/service/page all recognize this).
- `ui/`:
  - `AppErrorBoundary.tsx`: Global error boundary fallback
  - `AppLayout.tsx`: General layout container
  - `ErrorPage.tsx`: General error page component (for routing error handling)
  - `LoadingSkeleton.tsx`: Unified skeleton screen
  - `SnackbarProvider.tsx`: Global message Provider (wraps notistack)

##### src/store/index.ts

- Application-level store export: aggregates/forwards store hooks from each domain (or directly re-exports useTasksStore).

##### Other

- `test/setup.ts`: Test global initialization (jest-dom, mocks, MSW lifecycle).
- `test/setup-env.ts`: Test environment setup (environment variables, polyfills).
- `test/mocks/`: MSW request handlers and server setup.
- `main.tsx`: Vite entry point, mounts `<App />`.
- `vite-env.d.ts`: Vite environment variable type hints.

## Implementation Status

### Phase A — Shared Foundation ✅ COMPLETE

All infrastructure is implemented and tested:

- ✅ Domain types with comprehensive documentation
- ✅ HTTP client (Ky) with automatic camelCase/snake_case conversion
- ✅ React Query setup with global defaults
- ✅ useSnackbar hook wrapping notistack
- ✅ Utility functions (date, format, error)
- ✅ Test infrastructure (Vitest + RTL + MSW)
- ✅ Theme configuration with MUI + Tailwind alignment
- ✅ Error boundaries and error handling utilities

### Phase B — Task Feature 🚧 PARTIALLY COMPLETE

Backend integration and business logic are complete; UI components are stubs:

- ✅ Service layer (task.service.ts) - Full CRUD implementation
- ✅ React Query hooks (useTasks, useTaskActions) - Complete with optimistic updates
- ✅ Validation schemas (Zod) - Form validation ready
- ✅ Type definitions - Complete domain model
- ⚠️ Zustand store - Minimal implementation (React Query handles most state)
- ❌ UI Components - Stubs only (TaskList, TaskItem, TaskForm, etc.)
- ✅ Unit tests - Services and hooks tested

### Phase C — Lists (Filtering & Sorting) ❌ NOT STARTED

- ❌ useListFilters hook
- ❌ StatusTabs component
- ❌ FilterBar component
- ❌ SortMenu component
- ❌ Integration tests

### Phase D — Application Shell ✅ COMPLETE

- ✅ Providers composition (providers.tsx)
- ✅ Routing setup (routes.tsx)
- ✅ Layout components (AppLayout, ErrorBoundary, etc.)
- ❌ TasksPage composition (depends on Phase B/C components)

### Phase E — Quality Assurance ❌ NOT STARTED

- ❌ Comprehensive test coverage
- ❌ Accessibility audit
- ❌ Performance optimization
- ❌ Documentation finalization

## Next Steps

1. **Complete Phase B UI Components**: Implement TaskList, TaskItem, TaskForm with full functionality
2. **Start Phase C**: Build filtering and sorting UI components
3. **Integrate Phase D**: Compose TasksPage with all feature components
4. **Quality Gates**: Ensure tests pass, lint checks pass, accessibility standards met
