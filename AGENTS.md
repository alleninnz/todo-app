# Repository Guidelines

## Project Structure & Module Organization

### Directory Layout

- **`src/`** – Source code organized by feature slices
  - **`src/app/`** – Global providers, routing, and app shell
  - **`src/features/`** – Domain-driven feature modules (tasks, lists, etc.)
  - **`src/pages/`** – Route-level page components
  - **`src/shared/`** – Cross-cutting concerns (UI, utils, config)
  - **`src/store/`** – Global state management
  - **`src/test/`** – Test setup and utilities

### Static Assets Strategy

- **`public/`** – Static assets copied as-is to `dist/` (no Vite processing)
  - Use for: favicon, robots.txt, manifest.json, unchanging assets
  - Reference: `/favicon.svg` in HTML or `import.meta.env.BASE_URL + 'file.ext'`
- **`src/shared/assets/`** – Development assets processed by Vite (optimization, hashing)
  - **`images/`** – Business images (optimized, cache-busted)
  - **`icons/`** – Custom SVG icon components
  - **`fonts/`** – Custom fonts (prefer `@fontsource` packages when possible)
  - Reference: `import logo from '@shared/assets/images/logo.png'`

### Scripts and Automation

- Future automation scripts may live in `scripts/`; remove experimental helpers before committing.
- Colocate feature tests in `src/features/<slice>/__tests__/`; shared test setup in `src/test/setup.ts`.

## Build, Test, and Development Commands

### Development Workflow

- **`pnpm install`** – Install/update dependencies (run after pulling changes to `pnpm-lock.yaml`)
- **`pnpm dev`** – Start Vite dev server with HMR at `http://localhost:5173`
- **`pnpm build`** – Type-check with `tsc -b` and build optimized bundle to `dist/`
- **`pnpm preview`** – Serve production build locally for QA validation

### Code Quality

- **`pnpm lint`** – Run ESLint; resolve all errors, treat warnings as follow-up tasks
- **`pnpm lint:fix`** – Auto-fix ESLint issues where possible
- **`pnpm format`** – Format all code with Prettier (use before committing)
- **`pnpm format:check`** – Check code formatting without modifying files (CI/CD)

### Pre-commit Checklist

1. Run `pnpm lint` – ensure no quality issues
2. Run `pnpm format` – ensure consistent formatting
3. Run `pnpm build` – verify production build succeeds
4. Commit with conventional format (validated by git hook)

## Coding Style & Naming Conventions

### Component Guidelines

- Write React function components in TypeScript
- Prefer hooks for stateful concerns; keep UI components presentational
- Avoid embedding domain logic in UI unless unavoidable
- Export components as named exports (not default) for better refactoring
- **Prioritize Material UI components** to maintain design system consistency
- Manage global styles through MUI theme system; avoid scattered style definitions
- Use Tailwind only for quick layout and spacing adjustments, not for primary component styling

### File Naming & Structure

| Suffix        | Purpose                   | Example                   |
| ------------- | ------------------------- | ------------------------- |
| `.tsx`        | React components          | `TaskItem.tsx`            |
| `.ts`         | Non-component logic       | `useTaskActions.ts`       |
| `.store.ts`   | Zustand state slices      | `tasks.store.ts`          |
| `.service.ts` | API/business services     | `task.service.ts`         |
| `.mapper.ts`  | DTO transformations       | `task.mapper.ts`          |
| `.schema.ts`  | Validation schemas        | `task.schema.ts`          |
| `.types.ts`   | Type definitions          | `task.types.ts`           |
| `.paths.ts`   | API route definitions     | `task.paths.ts`           |
| `index.ts`    | Public API barrel exports | `features/tasks/index.ts` |

### Naming Conventions

- **Components**: `PascalCase` – `TaskItem`, `FilterBar`
- **Functions/Variables**: `camelCase` – `fetchTasks`, `isLoading`
- **Types/Interfaces**: `PascalCase` – `Task`, `TaskDTO`, `FilterState`
- **Constants**: `UPPER_SNAKE_CASE` – `API_BASE_URL`, `MAX_RETRIES`
- **Files (non-component)**: `kebab-case` – `task-service.ts`, `use-task-actions.ts`
- **CSS Classes**: `kebab-case` – `task-item`, `filter-bar`

### Styling Strategy

This project adopts a **Material UI primary, Tailwind v4 secondary** design strategy:

#### Material UI (Primary)

- **Component Library**: Use MUI's complete component system (Button, TextField, Card, Dialog, etc.)
- **Theme System**: Configure global theme (colors, fonts, spacing, etc.) in `@shared/config/theme`
- **Priority Usage**: All interactive components, form elements, and layout components should use MUI first
- **Customization**: Style customization through `sx` prop or theme overrides

```tsx
// ✅ Recommended: Use MUI components
import { Button, TextField, Card } from '@mui/material'
;<Button variant="contained" color="primary">
  Create Task
</Button>
```

#### Tailwind v4 (Secondary)

- **Purpose**: Quick implementation of margins, spacing, and simple layout utility classes
- **Use Cases**: Fine-tune spacing, responsive layouts, simple utilities (`flex`, `gap`, `p-4`, etc.)
- **Limitations**: Not for primary component styling; avoid conflicts with MUI theme
- **Configuration**: Global styles defined in `src/app/index.css`

```tsx
// ✅ Appropriate: Tailwind assists with layout and spacing
<div className="flex gap-4 p-4">
  <Button variant="contained">Confirm</Button>
  <Button variant="outlined">Cancel</Button>
</div>
```

#### Style Priority Rules

1. **MUI Components** → All UI components prioritize MUI
2. **MUI Theme** → Manage colors, fonts, spacing uniformly through theme
3. **MUI sx prop** → Style customization for specific components
4. **Tailwind Utilities** → Auxiliary layout and spacing adjustments
5. **Custom CSS** → Only when MUI/Tailwind insufficient; document reasoning in comments

#### Practices to Avoid

```tsx
// ❌ Not recommended: Overriding MUI component styles with Tailwind
<Button className="bg-blue-500 text-white rounded-lg">Button</Button>

// ❌ Not recommended: Mixed usage causing theme inconsistency
<div className="text-gray-900">  {/* Tailwind color */}
  <Typography color="textPrimary">Text</Typography>  {/* MUI color */}
</div>

// ✅ Recommended: Consistent use of MUI theme
<Box sx={{ color: 'text.primary' }}>
  <Typography color="textPrimary">Text</Typography>
</Box>
```

## Testing Guidelines

- Target Vitest with React Testing Library, initialized through `src/test/setup.ts`, to keep tooling aligned with Vite.
- Name specs `FeatureName.test.tsx` inside `src/features/<slice>/__tests__/`; cover rendering, interactions, and domain rules per slice.
- Document any intentional gaps in coverage when submitting reviews, and plan follow-up tasks for critical omissions.

## Commit Guidelines

### Conventional Commits Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) format and pass git hook validation:

```text
<type>: <description>

[optional body]
```

**Maximum length**: 100 characters (enforced by `commit-msg` hook)

### Commit Types

| Type       | Usage                    | Example                              |
| ---------- | ------------------------ | ------------------------------------ |
| `feat`     | New features             | `feat: add task priority filter`     |
| `fix`      | Bug fixes                | `fix: resolve task status toggle`    |
| `docs`     | Documentation            | `docs: update README setup guide`    |
| `style`    | Code style (formatting)  | `style: format tasks module code`    |
| `refactor` | Code restructuring       | `refactor: restructure task service` |
| `perf`     | Performance improvements | `perf: optimize list rendering`      |
| `test`     | Test additions/changes   | `test: add TaskItem unit tests`      |
| `chore`    | Build/tooling changes    | `chore: upgrade dependencies`        |

### Commit Best Practices

1. **Atomic commits** – One logical change per commit
2. **Group by domain** – Related changes together (e.g., all task feature changes)
3. **Separate concerns** – Don't mix feature/fix/docs in one commit
4. **Clear descriptions** – Explain what and why (not how)
5. **Sequential commits** – Execute one by one, avoid batch commits

### Examples

✅ Good:

```text
feat: implement task deadline reminder
fix: resolve state not updating after task deletion
docs: add API environment variables documentation
```

❌ Bad:

```text
update stuff
WIP
fix bug and add feature
```

## Architecture Overview

### Layered Design (DDD-Inspired)

```text
┌─────────────────────────────────────────┐
│  App Shell (src/app/)                   │  ← Providers, routing, global setup
├─────────────────────────────────────────┤
│  Pages (src/pages/)                     │  ← Route containers, orchestration
├─────────────────────────────────────────┤
│  Features (src/features/)               │  ← Domain logic, business rules
│  ├─ tasks/                              │
│  │  ├─ components/   (UI)               │
│  │  ├─ hooks/        (State logic)      │
│  │  ├─ services/     (API calls)        │
│  │  ├─ store/        (State)            │
│  │  ├─ types/        (Domain models)    │
│  │  └─ validation/   (Schemas)          │
│  └─ lists/                              │
├─────────────────────────────────────────┤
│  Shared (src/shared/)                   │  ← Cross-cutting primitives
│  ├─ api/         (HTTP client)          │
│  ├─ config/      (Env, theme)           │
│  ├─ hooks/       (Reusable hooks)       │
│  ├─ lib/         (Utilities)            │
│  ├─ types/       (Shared types)         │
│  ├─ ui/          (Common components)    │
│  └─ assets/      (Images, icons)        │
└─────────────────────────────────────────┘
```

### Dependency Rules

1. **Feature independence** – Features don't import from each other directly
2. **Upward dependencies only** – Lower layers don't depend on upper layers
3. **Shared consumption** – All features can use `shared/`; `shared/` uses nothing
4. **Public APIs** – Inter-feature communication through exported services/utilities
5. **No deep imports** – Import from feature's `index.ts`, not internal paths

### State Management Strategy

- **Zustand stores** – Synchronous state only (no async in actions)
- **Custom hooks** – Encapsulate async operations (API calls, side effects)
- **Service layer** – Pure functions for business logic and API orchestration
- **Separation of concerns** – UI → Hooks → Services → Store

### Example: Correct Dependencies

```typescript
// ✅ Good: Feature uses shared utilities
import { httpClient } from '@shared/api/httpClient'
import { formatDate } from '@shared/lib/format'

// ✅ Good: Feature exports public API
export { TaskList, TaskForm } from './components'
export { useTaskActions } from './hooks'

// ✅ Good: Page uses feature's public API
import { TaskList, useTaskActions } from '@features/tasks'

// ❌ Bad: Deep import bypasses public API
import { TaskItem } from '@features/tasks/components/TaskItem'

// ❌ Bad: Feature-to-feature direct import
import { useListFilters } from '@features/lists/hooks/useListFilters'
```

## Error Handling & Validation

### API Error Handling

- Centralize error transformation in `httpClient.ts`
- Surface user-friendly messages via `useSnackbar()`
- Log detailed errors to console in development
- Never expose raw API errors to users

### Form Validation

- Use Zod schemas in `.schema.ts` files for runtime validation
- Integrate with React Hook Form via `@hookform/resolvers/zod`
- Define schemas as single source of truth for validation rules
- Keep validation logic separate from UI components

## Performance Guidelines

- Lazy-load routes with `React.lazy()` in `routes.tsx`
- Memoize expensive computations with `useMemo()`
- Prevent unnecessary re-renders with `React.memo()` for pure components
- Use `useCallback()` for callbacks passed to child components
- Optimize list rendering with proper `key` props (prefer stable IDs over indices)
