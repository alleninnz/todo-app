# Git Workflow

## Overview

Automated command that analyzes, groups, commits, and pushes all changes following strict commit conventions. This eliminates manual commit message writing and ensures consistency.

## Command Triggers

User can say:

- "gcp"
- "commit and push"
- "commit all" / "commit all changes"
- "commit everything"
- "提交所有更改" / "提交并推送"

## Commit Message Format

### Structure

```text
type: description
```

### Mandatory Rules

- **Length**: ≤ 200 characters total
- **Case**: Description starts with lowercase
- **Punctuation**: No ending period
- **Scope**: One commit = one logical change only

### Commit Types

| Type       | Usage                                   |
| ---------- | --------------------------------------- |
| `feat`     | New features or functionality           |
| `fix`      | Bug fixes                               |
| `docs`     | Documentation updates                   |
| `style`    | Code formatting (no logic change)       |
| `refactor` | Code restructuring (no behavior change) |
| `test`     | Add or update tests                     |
| `chore`    | Build, dependencies, tooling, configs   |

## Automated Workflow

### 1. Analyze Changes

```bash
git status
```

Use `get_changed_files` to get detailed diffs and analyze change scope.

### 2. Intelligent Grouping

Automatically categorize changes by logical domains:

| Category      | File Patterns                                       | Commit Type             |
| ------------- | --------------------------------------------------- | ----------------------- |
| Configuration | `.gitignore`, `package.json`, `tsconfig.json`, etc. | `chore`                 |
| Source Code   | `src/**/*.ts`, `src/**/*.tsx`                       | `feat`/`fix`/`refactor` |
| Documentation | `docs/**/*.md`, `README.md`                         | `docs`                  |
| Tests         | `**/*.test.ts`, `**/*.test.tsx`, `**/__tests__/**`  | `test`                  |
| Build/CI      | Build scripts, CI/CD configs, `.github/**`          | `chore`                 |

**Splitting Rules:**

Different types of changes must be committed separately. If multiple logical changes are detected within the same category, split into multiple commits.

### 3. Generate Commit Messages

For each group, automatically generate a commit message:

- Analyze the nature of changes
- Select appropriate type prefix
- Write concise, descriptive message
- Validate format compliance

### 4. Execute Commits

For each group sequentially:

```bash
git add <files-in-group>
git commit -m "type: description"
```

### 5. Validate & Push

Check for git hook compliance, then:

```bash
git push origin <branch>
```

## Pre-Commit Validation

Before executing commits, Claude must:

1. Check for git hooks (e.g., `husky`, `pre-commit`)
2. Validate commit message format
3. Confirm logical consistency of change scope
4. If issues detected, proactively suggest splitting strategy

## Error Handling

If commit fails (e.g., rejected by git hooks):

1. Read and parse error messages
2. Analyze root cause (format, scope, etc.)
3. Automatically adjust commit message or grouping strategy
4. Retry with corrections
5. Report to user if manual intervention needed

## Example Execution

**User:** "gcp"

**Claude executes:**

```bash
# Step 1: Analyze
git status
get_changed_files

# Step 2-4: Group and commit by logic
git add .gitignore
git commit -m "chore: update gitignore rules"

git add src/features/tasks/ src/features/lists/
git commit -m "feat: implement task filtering and sorting"

git add src/shared/lib/__tests__/
git commit -m "test: add unit tests for date and format utilities"

git add docs/hooks.md
git commit -m "docs: update hooks documentation"

# Step 5: Push
git push origin main
```

## Key Principles

- **Atomic commits**: Each commit represents one logical change
- **Automated**: No manual commit message writing required
- **Consistent**: Strict adherence to format rules
- **Intelligent**: Smart grouping based on file paths and change types
- **Validated**: Pre-commit checks before pushing
- **Self-correcting**: Automatically handles errors and retries

## Notes

- User only needs to say "gcp" or similar trigger phrase
- Claude handles all analysis, grouping, and execution
- If changes span multiple domains, multiple commits will be created automatically
- Branch is detected automatically (defaults to current branch)
