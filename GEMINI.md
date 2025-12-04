# Project Context: Todo App

## 1. Overview

A modern, feature-rich Todo application built with React 19 and TypeScript. The project emphasizes a scalable feature-based architecture, robust type safety, and a polished UI using Material Design principles.

## 2. Tech Stack

- **Frontend Framework:** React 19 (Vite)
- **Language:** TypeScript (~5.9)
- **State Management:**
  - _Global:_ Zustand
  - _Server State:_ TanStack Query (React Query) v5
- **Styling:** Tailwind CSS v4, Material UI (MUI) v7, Emotion
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7
- **Networking:** Ky (configured with automatic snake_case/camelCase conversion)
- **Testing:** Vitest, React Testing Library, MSW
- **Package Manager:** pnpm (Strict enforcement)

## 3. Architecture

- **Feature-Based:** Code is organized by domain in `src/features/<feature-name>` (e.g., `tasks`, `lists`).
- **Shared Layer:** Common utilities, UI components, and hooks reside in `src/shared`.
- **App Layer:** Providers and global routing are in `src/app`.
- **Design Pattern:**
  - _Services:_ Handle API calls (`task.service.ts`).
  - _Hooks:_ Encapsulate logic and state (`useTaskActions.ts`).
  - _Components:_ Presentational logic.

## 4. Development Guidelines

- **Package Management:** ALWAYS use `pnpm`. Never `npm` or `yarn`.
- **Environment:** macOS (Apple Silicon) / Zsh.
- **File Creation:** Do not create arbitrary markdown files.
- **Naming Conventions:**
  - React Components: `PascalCase.tsx`
  - Hooks: `camelCase.ts` (prefix `use`)
  - Utilities/Services: `camelCase.ts`
- **Code Style:**
  - Prefer functional components.
  - strict equality (`===`).
  - JSDoc for complex logic.

## 5. Testing Strategy

- **Unit/Integration:** Run via `pnpm test`.
- **Mocks:** Use MSW for network requests.
- **Snapshot:** Use carefully; prefer explicit assertions.
- **Debug:** `VITE_ENABLE_DEBUG` enables detailed HTTP logging.

## 6. Git Workflow (Critical)

**Trigger:** "gcp", "commit and push"

**Commit Rules:**

1. **Atomic:** Separate config changes from code changes.
2. **Format:** `type: description` (lowercase, no period).
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
3. **Process:**
   - Analyze `git status`.
   - Group files by category (Source, Test, Config, Docs).
   - Commit groups sequentially.
   - Push.

_Reference: `docs/git-workflow.md`_

## 7. User Memories

- "Always use 'pnpm' for installation commands instead of npm or yarn."
- "I am developing on macOS (Apple Silicon). Ensure terminal commands are compatible with zsh."
- "Unless specified otherwise, my frontend stack is React with TypeScript, Tailwind CSS for styling, and React Query for data fetching."
- "DO NOT create a markdown file after your improvement, fixing or creating new features unless you are explicitly instructed"
