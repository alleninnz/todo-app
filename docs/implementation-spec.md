# Todo App MVP Implementation Spec

_This document translates `docs/requirements.md` into an actionable, phase-based roadmap. Follow the steps in sequence; each phase produces runnable code, tests, and documentation before moving on._

## 1. Context & Goals

- Deliver every functional/non-functional requirement in `docs/requirements.md`, prioritizing CRUD workflows, filtering/sorting, resilient UX states, and maintainable architecture.
- Preserve the feature-first layout that already exists in `src/`, leveraging MUI v7.3.6, Tailwind CSS v4.1.17, Zustand 5.0.9, React Query 5.90.12, Ky 1.14.1, React Hook Form 7.68.0, Zod 4.1.13, and Vitest 4.0.15 tooling.
- Keep quality gates green (`pnpm lint`, `pnpm test`, `pnpm build`) at each phase boundary, and maintain Storybook documentation for UI primitives.

## 2. Cross-Cutting Standards

- **Type Safety**: All modules must compile with TS strict mode and expose types via `index.ts` barrels. Runtime contracts validated with Zod.
- **State Management**: React Query owns server state with optimistic updates; Zustand owns client-side UI state; hooks orchestrate async flows.
- **UX Consistency**: Use MUI first, Tailwind utility classes for gaps/layout only. Provide loading, error, and empty states for all async views. Toast notifications via `notistack` wrappers.
- **Testing**: Co-locate Vitest + RTL suites (`__tests__`) beside source. Stub network with MSW. Add Storybook stories for visual documentation.

## 3. Target Artifacts by Area

| Area               | Key Files                                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared foundation  | `src/shared/api/httpClient.ts`, `src/shared/config/env.ts`, `src/shared/hooks/useSnackbar.ts`, `src/shared/lib/date.ts`, `src/shared/lib/format.ts`, `src/shared/lib/error.ts`, `src/shared/types/task.types.ts`, `src/test/setup.ts`, `src/test/mocks/**/*.ts` |
| Tasks feature      | `src/features/tasks/{services,validation,hooks,components}/**`, plus `index.ts` barrels and stories/tests                                                                                                                                                       |
| Lists feature      | `src/features/lists/{hooks,components}/**`, `index.ts`, stories/tests                                                                                                                                                                                           |
| App shell          | `src/app/{providers.tsx,routes.tsx}`, `src/app/App.tsx`, `src/pages/TasksPage.tsx`, shared UI components                                                                                                                                                        |
| QA & documentation | `docs/requirements.md` (source of truth), Storybook config, Vitest coverage reports                                                                                                                                                                             |

## 4. Implementation Phases

Each phase has explicit deliverables and verification steps. Finish all subtasks (including tests) before advancing.

### Phase A — Shared Foundation ✅ COMPLETE

- [x] 1. **Domain Types (`src/shared/types/task.types.ts`)**
  - Define task primitives: `TaskPriority`, `TaskStatus`, `Task`, `TaskDraft`, `TaskUpdate`, `TaskFilters`, `TaskSortField`, `TaskSortOption`.
  - API returns camelCase payloads (httpClient auto-converts), so a single `Task` shape is shared between client and server.
  - Include helper maps (`PRIORITY_ORDER`, `DEFAULT_FILTERS`, `DEFAULT_SORT`) for reuse across hooks/components.
  - Export via barrel for downstream consumers.

- [x] 2. **Runtime Validation (`src/features/tasks/validation/task.schema.ts`)**
  - Create Zod schemas mirroring the domain types; provide resolver for React Hook Form.
  - Centralize default values and string trimming logic.

- [x] 3. **Environment & HTTP Client**
  - `src/shared/config/env.ts` covers API base URL, timeout, and debug flags with type-safe accessors.
  - `src/shared/api/httpClient.ts` using Ky: JSON headers, snake/camel conversion, retry policy, structured error normalization (ApiError class), optional debug logging.

- [x] 4. **Shared Hooks & State**
  - `useSnackbar.ts`: wrap `notistack`'s `useSnackbar`, expose `showSuccess`, `showError`, `showWarning`, `showInfo`, `show` and utility helpers (auto-dismiss, action buttons).
  - **React Query**: Setup `QueryClient` with global defaults (staleTime, retry) and `QueryClientProvider` in `providers.tsx`.

- [x] 5. **Utilities (`src/shared/lib`)**
  - `date.ts`: helpers (`parseDateString`, `formatDate`, `isOverdue`, `getDaysUntilDue`, etc.).
  - `format.ts`: priority labels, truncation helpers, task metadata formatting.
  - `error.ts`: error categorization (`getErrorInfo`, `isNetworkError`, `extractStatusCode`), HTTP error messages, network/component error constants.

- [x] 6. **Test & Storybook Setup**
  - `src/test/setup.ts` registers `@testing-library/jest-dom/vitest`, configures MSW server lifecycle hooks.
  - `src/test/setup-env.ts` sets up test environment variables and polyfills.
  - `src/test/mocks/` contains MSW handlers and server configuration.
  - Storybook configuration loads Tailwind styles and MUI theme.

- [x] 7. **Error Handling Infrastructure**
  - `AppErrorBoundary.tsx`: Catches React errors, shows context-aware recovery actions
  - `ErrorPage.tsx`: Router error boundary and custom error display component
  - Comprehensive error utilities in `shared/lib/error.ts`

### Phase B — Task Feature Slice 🚧 PARTIALLY COMPLETE

- [x] 1. **Service Layer (`task.service.ts`)**
  - Implement CRUD helpers (`getAll`, `getById`, `create`, `update`, `delete`).
  - All methods use httpClient and return typed promises.

- [x] 2. **React Query Hooks**
  - `useTasks.ts`: Query hook with client-side filtering and sorting, provides derived counts (total, active, completed).
  - `useTaskActions.ts`: Mutation hooks for create/update/delete with optimistic updates, snackbar feedback, and rollback on error. Includes query key factory (`taskKeys`).

- [x] 3. **Validation Schemas**
  - Zod schemas for task creation and updates with React Hook Form resolver.

- [x] 4. **Type Definitions**
  - Complete domain model in `shared/types/task.types.ts`.

- [x] 5. **Zustand Store (Minimal)**
  - `tasks.store.ts`: Basic store for UI-specific state (React Query handles server state).

- [ ] 6. **UI Components** ⚠️ STUBS ONLY
  - `TaskList.tsx`: Orchestrate loading/error/empty states, render list with proper structure.
  - `TaskItem.tsx`: Show checkbox, title, metadata chips, inline menu for edit/delete; accessibility (aria labels, focus order).
  - `TaskForm.tsx`: React Hook Form + MUI inputs (title, description, due date picker, priority select). Integrate Zod resolver and inline validation messaging.
  - `TaskEmptyState.tsx`, `TaskErrorState.tsx`: Dedicated components with CTA/retry actions.
  - All components currently are placeholder stubs.

- [x] 7. **Unit Tests**
  - Service tests with MSW mocking
  - Hook tests (useTasks, useTaskActions) with React Query testing
  - Validation schema tests

- [ ] 8. **Component Tests** ⚠️ PENDING UI IMPLEMENTATION
  - Stories per UI state
  - Component interaction tests with RTL

- [ ] 9. **Verification**
  - `pnpm test -- features/tasks` and `pnpm storybook` to validate coverage and docs.

### Phase C — Lists (Filtering & Sorting) ❌ NOT STARTED

- [ ] 1. **State Hook (`useListFilters.ts`)**
  - Manage local filter state (status, priority, sort field/direction); expose derived props for tabs/menus and callbacks (`setStatus`, `togglePriority`, `setSort`).
  - Future-proof with optional URL sync placeholder API.

- [ ] 2. **Components**
  - `StatusTabs.tsx`: MUI `<Tabs>` for All/Active/Completed; keyboard accessible.
  - `FilterBar.tsx`: Compose status tabs, priority chips, search stub (if planned), and space for future filters.
  - `SortMenu.tsx`: Button-triggered menu to pick sort field + direction; ensure tasks without due dates sort last when due-date sort is active.
  - All components accept props-only dependencies; no direct store access.

- [ ] 3. **Integration & Tests**
  - Provide stories showing combined filter/sort interactions.
  - RTL tests for `useListFilters` and components to ensure callbacks fire and ARIA contracts hold.

- [ ] 4. **Verification**
  - `pnpm test -- features/lists` and review Storybook controls.

### Phase D — Application Shell & Composition 🚧 PARTIALLY COMPLETE

- [x] 1. **Providers (`src/app/providers.tsx`)**
  - Ensure React Router, MUI theme provider, React Query client, Snackbar provider are wired once. MSW starts in dev/test.

- [x] 2. **Routing (`src/app/routes.tsx`, `src/app/App.tsx`)**
  - Register Tasks route as default; add ErrorBoundary wrappers per route; lazy-load future routes.

- [x] 3. **Layout (`src/shared/ui/AppLayout.tsx`, `AppErrorBoundary.tsx`, `ErrorPage.tsx`, `LoadingSkeleton.tsx`)**
  - Implement responsive layout with header, content container, and slots for toasts.
  - Error boundary fallback uses ErrorPage component.

- [ ] 4. **Tasks Page (`src/pages/TasksPage.tsx`)** ⚠️ PENDING COMPONENTS
  - Compose `FilterBar`, `SortMenu`, `TaskList`, and `TaskForm` modal logic.
  - On mount, use `useTasks()` hook; pass filter/sort state from `useListFilters` (when available).
  - Wire optimistic updates via `useTaskActions` mutations.

- [x] 5. **Global Store Barrel (`src/store/index.ts`)**
  - Re-export Zustand hooks/selectors to keep imports consistent.

- [ ] 6. **Verification**
  - Manual QA run-through: load tasks, create/edit/delete, apply filters/sorts, observe loading/error states.
  - `pnpm dev` for smoke test; log issues for next phase if any.

### Phase E — Quality Gates & Launch Prep ❌ NOT STARTED

- [ ] 1. **Automated Testing**
  - Reach ≥80% coverage focusing on services, hooks, and complex components.
  - Add integration tests exercising: full CRUD happy path, filter/sort combos, optimistic update rollback, and snackbar feedback.

- [ ] 2. **Accessibility & Performance**
  - Audit key pages with axe/Storybook accessibility addon; fix WCAG violations.
  - Measure bundle via `pnpm build`; flag chunks > recommended size.

- [ ] 3. **Documentation**
  - Update `README.md` with setup/run instructions, environment variables, and testing commands.
  - Capture API expectations and MSW conventions inside docs.

- [ ] 4. **Operational Checklist**
  - Verify `.env.example` matches required vars.
  - Run `pnpm lint`, `pnpm test`, `pnpm build` sequentially. Document any known issues/blockers.

## 5. Deliverables Checklist

- [x] Shared foundation (types, env, http client, hooks, utilities, tests) completed.
- [x] Task service layer and React Query hooks implemented with tests.
- [ ] Task UI components implemented (currently stubs).
- [ ] Lists feature delivers filtering/sorting state + components with coverage.
- [ ] App shell wires providers, layout, routing, and Tasks page composition.
- [ ] Quality gate reports (tests, lint, build, accessibility) captured prior to release.

## 6. Technology Stack (Actual Versions)

- **React**: 19.2.1 with TypeScript 5.9.3
- **Build**: Vite (Rolldown) 7.2.3
- **Package Manager**: pnpm
- **UI**: Material-UI 7.3.6 + Tailwind CSS 4.1.17
- **State**: Zustand 5.0.9 (client) + TanStack Query 5.90.12 (server)
- **Forms**: React Hook Form 7.68.0 + Zod 4.1.13
- **HTTP**: Ky 1.14.1 with automatic camelCase/snake_case conversion
- **Testing**: Vitest 4.0.15 + Testing Library 16.3.0 + MSW 2.12.4
- **Notifications**: notistack 3.0.2

---

Use this spec as the implementation contract. Commit incrementally per phase, keep documentation updated, and ensure each step satisfies the corresponding requirement before moving on.
