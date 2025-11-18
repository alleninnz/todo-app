# Todo App MVP Implementation Spec

_This document translates `docs/requirements.md` into an actionable, phase-based roadmap. Follow the steps in sequence; each phase produces runnable code, tests, and documentation before moving on._

## 1. Context & Goals

- Deliver every functional/non-functional requirement in `docs/requirements.md`, prioritizing CRUD workflows, filtering/sorting, resilient UX states, and maintainable architecture.
- Preserve the feature-first layout that already exists in `src/`, leveraging MUI, Tailwind (spacing/layout only), Zustand, Ky, React Hook Form, Zod, and Vitest tooling.
- Keep quality gates green (`pnpm lint`, `pnpm test`, `pnpm build`) at each phase boundary, and maintain Storybook documentation for UI primitives.

## 2. Cross-Cutting Standards

- **Type Safety**: All modules must compile with TS strict mode and expose types via `index.ts` barrels. Runtime contracts validated with Zod.
- **State Management**: Zustand owns client state; hooks orchestrate async flows and optimistic updates; services talk to the API.
- **UX Consistency**: Use MUI first, Tailwind utility classes for gaps/layout only. Provide loading, error, and empty states for all async views. Toast notifications via `notistack` wrappers.
- **Testing**: Co-locate Vitest + RTL suites (`__tests__`) beside source. Stub network with MSW. Add Storybook stories for visual documentation.

## 3. Target Artifacts by Area

| Area               | Key Files                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared foundation  | `src/shared/api/httpClient.ts`, `src/shared/config/env.ts`, `src/shared/hooks/useAsyncState.ts`, `src/shared/hooks/useSnackbar.ts`, `src/shared/lib/date.ts`, `src/shared/lib/format.ts`, `src/shared/types/task.types.ts`, `src/test/setup.ts`, `src/test/mocks/**/*.ts` |
| Tasks feature      | `src/features/tasks/{types,validation,services,store,hooks,components}/**`, plus `index.ts` barrels and stories/tests                                                                                                                                                     |
| Lists feature      | `src/features/lists/{hooks,components}/**`, `index.ts`, stories/tests                                                                                                                                                                                                     |
| App shell          | `src/app/{providers.tsx,routes.tsx}`, `src/app/App.tsx`, `src/pages/TasksPage.tsx`, shared UI components                                                                                                                                                                  |
| QA & documentation | `docs/requirements.md` (source of truth), Storybook config, Vitest coverage reports                                                                                                                                                                                       |

## 4. Implementation Phases

Each phase has explicit deliverables and verification steps. Finish all subtasks (including tests) before advancing.

### Phase A — Shared Foundation

- [x] 1. **Domain Types (`src/shared/types/task.types.ts`)**
  - Define task primitives: `TaskPriority`, `TaskStatus`, `Task`, `TaskDraft`, `TaskFilters`, `TaskSortField`, `TaskSort`.
  - API already returns camelCase payloads, so a single `Task` shape is shared between client and server.
  - Include helper maps (`PRIORITY_ORDER`, `SORT_COMPARATORS`) for reuse across hooks/components.
  - Export via barrel for downstream consumers.

- [x] 2. **Runtime Validation (`src/features/tasks/validation/task.schema.ts`)**
  - Create Zod schemas mirroring the domain types; provide `taskFormResolver` for React Hook Form.
  - Centralize default values and string trimming logic.
- [x] 3. **Environment & HTTP Client**
  - Extend `src/shared/config/env.ts` to cover API base URL, timeout, and debug flags with type-safe accessors.
  - Build `src/shared/api/httpClient.ts` using Ky: JSON headers, snake/camel conversion, retry policy, structured error normalization, optional debug logging.
- [x] 4. **Shared Hooks**
  - `useSnackbar.ts`: wrap `notistack`’s `useSnackbar`, expose `showSuccess`, `showError`, and utility helpers (auto-dismiss, action buttons).
  - `useAsyncState.ts`: discriminated union state machine with `execute(asyncFn, options)` supporting abort signals and optimistic updates.
- [x] 5. **Utilities (`src/shared/lib`)**
  - `date.ts`: helpers (`isOverdue`, `formatDueDate`, `compareByDueDate`, `sortNullsLast`).
  - `format.ts`: priority labels, truncation helpers, `formatTaskMeta` (e.g., `"Due tomorrow · High"`).
- [x] 6. **Test & Storybook Setup**
  - Ensure `src/test/setup.ts` registers `@testing-library/jest-dom/vitest`, configures MSW server lifecycle, and polyfills missing browser APIs.
  - Update Storybook configuration (if needed) to load Tailwind styles and MUI theme.

### Phase B — Task Feature Slice

- [ ] 1. **API Paths & Formatting**
  - `task.paths.ts`: constants for list + detail endpoints.
  - API responses already match the domain model, so skip extra mapping layers. Provide light helpers (if needed) to normalize dates or default optional fields without introducing additional request/response-specific types.
- [ ] 2. **Service Layer (`task.service.ts`)**
  - Implement CRUD helpers (`fetchTasks`, `createTask`, `updateTask`, `deleteTask`, `toggleTaskComplete`).
  - Accept `AbortSignal` for fetches; propagate normalized errors.
- [ ] 3. **Zustand Store (`tasks.store.ts`)**
  - State: `items`, `isLoading`, `error`, `filters`, `sort`, `selectedTaskId`.
  - Actions: `setTasks`, `addTask`, `updateTask`, `removeTask`, `setFilters`, `setSort`, `setLoading`, `setError`, `selectTask`.
  - Provide selectors + hooks for components; expose via barrel.
- [ ] 4. **Hooks**
  - `useTaskActions.ts`: orchestrate API calls, optimistic updates, and snackbar feedback. Include rollback logic when requests fail.
  - `useTaskDetail.ts`: derive single task by id; fetch detail on demand if missing.
  - Both hooks reuse `useAsyncState` and share error messaging helpers.
- [ ] 5. **UI Components**
  - `TaskList.tsx`: orchestrate loading/error/empty states, render list with virtualization-ready structure.
  - `TaskItem.tsx`: show checkbox, title, metadata chips, inline menu for edit/delete; respect accessibility (aria labels, focus order).
  - `TaskForm.tsx`: React Hook Form + MUI inputs (title, description, due date picker, priority select). Integrate Zod resolver and inline validation messaging.
  - `TaskEmptyState.tsx`, `TaskErrorState.tsx`: dedicated components with CTA/retry actions.
  - `TaskListSkeleton.tsx` (if not present) for consistent loading visuals.
- [ ] 6. **Stories & Tests**
  - Component stories per UI state, using MSW to mock API responses.
  - Vitest suites covering services (with MSW), store reducers, and hooks (simulate optimistic updates + error rollback).
- [ ] 7. **Verification**
  - `pnpm test -- features/tasks` and `pnpm storybook` (or `pnpm test-storybook`) to validate coverage and docs.

### Phase C — Lists (Filtering & Sorting)

- [ ] 1. **State Hook (`useListFilters.ts`)**
  - Manage local filter state (status, priority, sort field/direction); expose derived props for tabs/menus and callbacks (`setStatus`, `togglePriority`, `setSort`).
  - Future-proof with optional URL sync placeholder API.
- [ ] 2. **Components**
  - `StatusTabs.tsx`: MUI `<Tabs>` for All/Active/Completed; keyboard accessible.
  - `FilterBar.tsx`: compose status tabs, priority chips, search stub (if planned), and imagery space for future filters.
  - `SortMenu.tsx`: button-triggered menu to pick sort field + direction; ensure tasks without due dates sort last when due-date sort is active.
  - All components accept props-only dependencies; no direct store access.
- [ ] 3. **Integration & Tests**
  - Provide stories showing combined filter/sort interactions.
  - RTL tests for `useListFilters` and components to ensure callbacks fire and ARIA contracts hold.
- [ ] 4. **Verification**
  - `pnpm test -- features/lists` and review Storybook controls.

### Phase D — Application Shell & Composition

- [ ] 1. **Providers (`src/app/providers.tsx`)**
  - Ensure React Router, MUI theme provider, Snackbar provider, and any query clients are wired once. Confirm MSW only starts in dev/test.
- [ ] 2. **Routing (`src/app/routes.tsx`, `src/app/App.tsx`)**
  - Register Tasks route as default; add ErrorBoundary wrappers per route; lazy-load future routes.
- [ ] 3. **Layout (`src/shared/ui/AppLayout.tsx`, `AppErrorBoundary.tsx`, `ErrorPage.tsx`, `LoadingSkeleton.tsx`)**
  - Implement responsive layout with header, content container, and slots for toasts.
  - Update error boundary fallback to use new error/empty components.
- [ ] 4. **Tasks Page (`src/pages/TasksPage.tsx`)**
  - Compose `FilterBar`, `SortMenu`, `TaskList`, and `TaskForm` modal logic.
  - On mount, call `useTaskActions().loadTasks()` if store empty; pass filter/sort state from `useListFilters` to store selectors.
  - Wire optimistic updates: e.g., on completion toggle, update store first, then revert on failure.
- [ ] 5. **Global Store Barrel (`src/store/index.ts`)**
  - Re-export Zustand hooks/selectors to keep imports consistent.
- [ ] 6. **Verification**
  - Manual QA run-through: load tasks, create/edit/delete, apply filters/sorts, observe loading/error states.
  - `pnpm dev` for smoke test; log issues for next phase if any.

### Phase E — Quality Gates & Launch Prep

- [ ] 1. **Automated Testing**
  - Reach ≥80% coverage focusing on services, stores, hooks, and complex components.
  - Add integration tests exercising: full CRUD happy path, filter/sort combos, optimistic update rollback, and snackbar feedback.
- [ ] 2. **Accessibility & Performance**
  - Audit key pages with axe/Storybook accessibility addon; fix WCAG violations.
  - Measure bundle via `pnpm build -- --mode production`; flag chunks > recommended size.
- [ ] 3. **Documentation**
  - Update `README.md` with setup/run instructions, environment variables, and testing commands.
  - Capture API expectations and MSW conventions inside `docs/requirements.md` or new appendices as needed.
- [ ] 4. **Operational Checklist**
  - Verify `.env.example` matches required vars.
  - Run `pnpm lint`, `pnpm test`, `pnpm build` sequentially. Document any known issues/blockers.

## 5. Deliverables Checklist

- [ ] Shared foundation (types, env, http client, hooks, utilities, tests) completed.
- [ ] Task feature slice implements services, store, hooks, UI, stories, and tests.
- [ ] Lists feature delivers filtering/sorting state + components with coverage.
- [ ] App shell wires providers, layout, routing, and Tasks page composition.
- [ ] Quality gate reports (tests, lint, build, accessibility) captured prior to release.

---

Use this spec as the implementation contract. Commit incrementally per phase, keep documentation updated, and ensure each step satisfies the corresponding requirement before moving on.
