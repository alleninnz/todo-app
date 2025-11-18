/**
 * Task Domain Types
 *
 * This module defines the core task types, filters, and sorting options
 * used throughout the application.
 *
 * ## Architecture
 * - Frontend uses **camelCase** naming convention
 * - Backend APIs use **snake_case** naming convention
 * - HTTP client interceptors automatically handle naming conversions
 * - No need to manually define DTOs (Data Transfer Objects)
 *
 * ## Type Categories
 * 1. **Core Entities**: Task, TaskDraft, TaskUpdate
 * 2. **UI State Types**: TaskFilters, TaskSortOption
 * 3. **Enums & Unions**: TaskPriority, TaskStatus, TaskSortField, TaskSortDirection
 * 4. **Constants**: PRIORITY_ORDER, DEFAULT_FILTERS, DEFAULT_SORT, Labels
 *
 * @module shared/types/task.types
 */

/* ==================== Enums & Union Types ==================== */

/**
 * Task priority levels.
 *
 * Ordered from lowest to highest priority for sorting purposes.
 * Higher priority tasks should be displayed/sorted first.
 */
export type TaskPriority = 'none' | 'low' | 'medium' | 'high'

/**
 * Task status filter options.
 *
 * Used for filtering the task list by completion status.
 * - `all`: Show all tasks
 * - `active`: Show only incomplete tasks
 * - `completed`: Show only completed tasks
 */
export type TaskStatus = 'all' | 'active' | 'completed'

/* ==================== Core Domain Entities ==================== */

/**
 * Core task domain model.
 *
 * Represents a task with all its properties in the application domain.
 * This is the primary data structure used throughout the frontend application.
 *
 * @remarks
 * - Uses date strings in dd-mm-YYYY format for consistency with API responses
 * - Avoids Date objects to prevent serialization issues
 * - Backend field mapping (auto-converted by httpClient):
 *   - `createdAt` ↔ `created_at`
 *   - `dueDate` ↔ `due_date`
 *
 * @example
 * ```typescript
 * const task: Task = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   title: 'Complete project documentation',
 *   description: 'Write comprehensive API docs',
 *   priority: 'high',
 *   completed: false,
 *   createdAt: '17-11-2025',
 *   dueDate: '20-11-2025',
 * }
 * ```
 */
export interface Task {
  /** Unique identifier (UUID from backend) */
  id: string
  /** Task title (required, max 255 characters) */
  title: string
  /** Optional detailed description */
  description?: string
  /** Priority level affecting sort order and visual prominence */
  priority: TaskPriority
  /** Completion status */
  completed: boolean
  /** Date string in dd-mm-YYYY format when task was created (server-generated) */
  createdAt: string
  /** Optional date string in dd-mm-YYYY format for task deadline */
  dueDate?: string
}

/**
 * Task creation payload.
 *
 * Omits server-generated fields (`id`, `createdAt`) from the Task interface.
 * Use this type when creating new tasks via the API or in form components.
 *
 * @remarks
 * Server will automatically generate:
 * - `id`: UUID
 * - `createdAt`: Current timestamp
 *
 * @example
 * ```typescript
 * const draft: TaskDraft = {
 *   title: 'New Task',
 *   description: 'Task details',
 *   priority: 'medium',
 *   completed: false,
 *   dueDate: '01-12-2025',
 * }
 *
 * // Used in API calls
 * await createTask(draft) // POST /api/tasks
 *
 * // Used in form state
 * const [formData, setFormData] = useState<TaskDraft>({ ... })
 * ```
 */
export type TaskDraft = Omit<Task, 'id' | 'createdAt'>

/**
 * Task update payload.
 *
 * All fields are optional - only provided fields will be updated.
 * Omits immutable fields (`id`, `createdAt`) from the Task interface.
 *
 * @example
 * ```typescript
 * const update: TaskUpdate = {
 *   completed: true,
 *   priority: 'low',
 * }
 *
 * await updateTask('task-id', update) // PATCH /api/tasks/:id
 * ```
 */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>

/* ==================== UI State Types ==================== */

/**
 * Task filter criteria.
 *
 * Defines the available filters for the task list.
 * This is a frontend-only type, not sent to the backend.
 *
 * @example
 * ```typescript
 * const filters: TaskFilters = {
 *   status: 'active',
 *   priority: 'high',
 * }
 * ```
 */
export interface TaskFilters {
  /** Filter by completion status */
  status: TaskStatus
  /** Optional filter by priority level */
  priority?: TaskPriority
}

/**
 * Task sort field options.
 *
 * Supported sorting fields for task list.
 * - `createdAt`: Sort by creation date
 * - `dueDate`: Sort by due date (tasks without due date go last)
 * - `priority`: Sort by priority level (using PRIORITY_ORDER)
 */
export type TaskSortField = 'createdAt' | 'dueDate' | 'priority'

/**
 * Sort direction options.
 *
 * - `asc`: Ascending order (A-Z, 0-9, earliest to latest)
 * - `desc`: Descending order (Z-A, 9-0, latest to earliest)
 */
export type TaskSortDirection = 'asc' | 'desc'

/**
 * Task sorting configuration.
 *
 * Combines sort field and direction for task list ordering.
 *
 * @example
 * ```typescript
 * // Sort by creation date, newest first
 * const sort: TaskSortOption = {
 *   field: 'createdAt',
 *   direction: 'desc',
 * }
 *
 * // Sort by priority, highest first
 * const sortByPriority: TaskSortOption = {
 *   field: 'priority',
 *   direction: 'desc',
 * }
 * ```
 */
export interface TaskSortOption {
  /** Field to sort by */
  field: TaskSortField
  /** Sort direction (ascending or descending) */
  direction: TaskSortDirection
}

/* ==================== Constants & Configuration ==================== */

/**
 * Priority ordering for sorting operations.
 *
 * Maps priority levels to numeric values for comparison.
 * Higher numbers indicate higher priority.
 *
 * @example
 * ```typescript
 * const taskA = { priority: 'high' }
 * const taskB = { priority: 'low' }
 *
 * // Sort by priority descending
 * const comparison = PRIORITY_ORDER[taskB.priority] - PRIORITY_ORDER[taskA.priority]
 * // Result: 1 - 3 = -2 (taskA comes first)
 * ```
 */
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const

/**
 * Default task filter values.
 *
 * Used as initial state for task list filters.
 * Shows all tasks without priority filtering.
 */
export const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
} as const

/**
 * Default task sort option.
 *
 * Used as initial state for task list sorting.
 * Sorts by creation date, newest first (most recent at top).
 */
export const DEFAULT_SORT: TaskSortOption = {
  field: 'createdAt',
  direction: 'desc',
} as const

/* ==================== UI Display Labels ==================== */

/**
 * Status filter labels for UI display.
 *
 * Human-readable labels for task status filters.
 * Used in tabs, dropdowns, and filter UI components.
 *
 * @example
 * ```typescript
 * <Tab label={STATUS_LABELS.active} />
 * ```
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
} as const

/**
 * Priority labels for UI display.
 *
 * Human-readable labels for task priority levels.
 * Used in badges, select menus, and priority indicators.
 *
 * @example
 * ```typescript
 * <Chip label={PRIORITY_LABELS[task.priority]} />
 * ```
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const

/**
 * Sort field labels for UI display.
 *
 * Human-readable labels for sort field options.
 * Used in sort menus and dropdowns.
 *
 * @example
 * ```typescript
 * <MenuItem value="createdAt">
 *   {SORT_FIELD_LABELS.createdAt}
 * </MenuItem>
 * ```
 */
export const SORT_FIELD_LABELS: Record<TaskSortField, string> = {
  createdAt: 'Created Date',
  dueDate: 'Due Date',
  priority: 'Priority',
} as const
