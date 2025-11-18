/**
 * Task Validation Schemas
 *
 * This module provides comprehensive Zod validation schemas for task-related
 * forms and API operations, with runtime validation and type inference.
 *
 * ## Schema Variants
 * - **taskFormSchema**: Complete validation for create/edit forms
 * - **taskDraftSchema**: Validation for POST /api/tasks payloads
 * - **taskUpdateSchema**: Validation for PATCH /api/tasks/:id payloads
 *
 * ## Integration
 * - React Hook Form via zodResolver
 * - Matches domain types from shared/types/task.types.ts
 * - Provides custom error messages for UX clarity
 *
 * @module features/tasks/validation/task.schema
 * @see {@link module:shared/types/task.types}
 *
 * @example
 * ```typescript
 * import { taskFormSchema, taskFormResolver } from './task.schema'
 * import { useForm } from 'react-hook-form'
 *
 * const form = useForm({
 *   resolver: taskFormResolver,
 *   defaultValues: {
 *     title: '',
 *     description: '',
 *     priority: 'none',
 *     completed: false,
 *   }
 * })
 * ```
 */

import { isPastDate, isValidDateFormat } from '@/shared/lib/date'
import type { TaskPriority } from '@/shared/types/task.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/* ==================== Constants ==================== */

/**
 * Maximum allowed length for task title.
 * Aligns with database schema and type definitions.
 */
const TITLE_MAX_LENGTH = 255

/**
 * Maximum allowed length for task description.
 * Prevents database issues and ensures reasonable content size.
 */
const DESCRIPTION_MAX_LENGTH = 5000

/**
 * Valid task priority levels.
 * Must match TaskPriority type exactly.
 */
const PRIORITY_VALUES: [TaskPriority, ...TaskPriority[]] = [
  'none',
  'low',
  'medium',
  'high',
]

/* ==================== Base Field Schemas ==================== */

/**
 * Title field schema with validation rules.
 *
 * Rules:
 * - Required (min 1 character after trim)
 * - Max 255 characters
 * - Automatically trimmed
 * - Custom error messages
 */
const titleSchema = z
  .string({ message: 'Title must be a text value' })
  .trim()
  .min(1, 'Title cannot be empty')
  .max(TITLE_MAX_LENGTH, `Title cannot exceed ${TITLE_MAX_LENGTH} characters`)

/**
 * Description field schema with validation rules.
 *
 * Rules:
 * - Optional field
 * - Max 5000 characters
 * - Automatically trimmed
 */
const descriptionSchema = z
  .string({ message: 'Description must be a text value' })
  .trim()
  .max(
    DESCRIPTION_MAX_LENGTH,
    `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`
  )
  .optional()

/**
 * Priority field schema with validation rules.
 *
 * Rules:
 * - Must be one of: 'none', 'low', 'medium', 'high'
 * - Defaults to 'none' if not provided
 * - Type-safe enum validation
 */
const prioritySchema = z
  .enum(PRIORITY_VALUES, {
    message: 'Priority must be one of: none, low, medium, high',
  })
  .default('none')

/**
 * Completed status field schema.
 *
 * Rules:
 * - Must be boolean
 * - Defaults to false for new tasks
 */
const completedSchema = z
  .boolean({ message: 'Completed status must be true or false' })
  .default(false)

/**
 * Due date field schema with validation rules.
 *
 * Rules:
 * - Optional field
 * - Must be valid dd-mm-YYYY format
 * - Must represent a valid calendar date
 * - Cannot be in the past
 * - Transforms empty strings to undefined
 *
 * @remarks
 * Validation includes:
 * - Format check: dd-mm-YYYY pattern
 * - Calendar validation: No invalid dates like 32-01-2025 or 29-02-2025
 * - Range validation: Month 01-12, day valid for month/year
 * - Temporal validation: Due date must be today or future
 *
 * @example
 * ```typescript
 * // Valid examples
 * dueDateSchema.parse('20-11-2025') // ✅
 * dueDateSchema.parse('01-01-2026') // ✅
 * dueDateSchema.parse('29-02-2024') // ✅ (leap year)
 * dueDateSchema.parse(undefined)    // ✅ (optional)
 * dueDateSchema.parse('')           // ✅ (transforms to undefined)
 *
 * // Invalid examples
 * dueDateSchema.parse('2025-11-20') // ❌ (wrong format)
 * dueDateSchema.parse('32-01-2025') // ❌ (invalid day)
 * dueDateSchema.parse('20-13-2025') // ❌ (invalid month)
 * dueDateSchema.parse('29-02-2025') // ❌ (not leap year)
 * dueDateSchema.parse('15-11-2024') // ❌ (past date if current is 18-11-2025)
 * ```
 */
const dueDateSchema = z
  .string({ message: 'Due date must be a valid date string' })
  .optional()
  .transform(val => (val === '' ? undefined : val))
  .refine(
    val => {
      if (!val) return true
      return isValidDateFormat(val)
    },
    {
      message:
        'Due date must be in dd-mm-YYYY format and represent a valid date (e.g., 20-11-2025)',
    }
  )
  .refine(
    val => {
      if (!val) return true
      return !isPastDate(val)
    },
    { message: 'Due date cannot be in the past' }
  )

/* ==================== Schema Compositions ==================== */

/**
 * Complete task form validation schema.
 *
 * Used for create and edit forms with comprehensive field validation.
 * Includes all task properties with defaults and error messages.
 *
 * @example
 * ```typescript
 * // Type inference
 * type FormData = z.infer<typeof taskFormSchema>
 *
 * // Manual validation
 * const result = taskFormSchema.safeParse({
 *   title: 'Complete documentation',
 *   description: 'Write comprehensive API docs',
 *   priority: 'high',
 *   completed: false,
 *   dueDate: '01-12-2025',
 * })
 *
 * if (result.success) {
 *   console.log(result.data) // Validated and transformed data
 * } else {
 *   console.error(result.error.issues) // Validation errors
 * }
 * ```
 */
export const taskFormSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  completed: completedSchema,
  dueDate: dueDateSchema,
})

/**
 * Task draft schema for API POST requests.
 *
 * Represents the payload for creating new tasks.
 * Omits server-generated fields (id, createdAt).
 *
 * @example
 * ```typescript
 * const draft = taskDraftSchema.parse({
 *   title: 'New Task',
 *   priority: 'medium',
 *   completed: false,
 * })
 *
 * await fetch('/api/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify(draft),
 * })
 * ```
 */
export const taskDraftSchema = taskFormSchema

/**
 * Task update schema for API PATCH requests.
 *
 * All fields are optional - only provided fields will be updated.
 * Used for partial updates to existing tasks.
 *
 * @example
 * ```typescript
 * const update = taskUpdateSchema.parse({
 *   completed: true,
 *   priority: 'low',
 * })
 *
 * await fetch('/api/tasks/123', {
 *   method: 'PATCH',
 *   body: JSON.stringify(update),
 * })
 * ```
 */
export const taskUpdateSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema,
  priority: prioritySchema.optional(),
  completed: completedSchema.optional(),
  dueDate: dueDateSchema,
})

/* ==================== Type Exports ==================== */

/**
 * Inferred TypeScript type from taskFormSchema.
 *
 * Use this type for form state and validation.
 * Automatically syncs with schema changes.
 *
 * @example
 * ```typescript
 * const [formData, setFormData] = useState<TaskFormData>({
 *   title: '',
 *   description: undefined,
 *   priority: 'none',
 *   completed: false,
 *   dueDate: undefined,
 * })
 * ```
 */
export type TaskFormData = z.infer<typeof taskFormSchema>

/**
 * Inferred TypeScript type from taskDraftSchema.
 *
 * Use for task creation payloads.
 */
export type TaskDraftData = z.infer<typeof taskDraftSchema>

/**
 * Inferred TypeScript type from taskUpdateSchema.
 *
 * Use for task update payloads (partial updates).
 */
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>

/* ==================== React Hook Form Integration ==================== */

/**
 * Pre-configured zodResolver for React Hook Form integration.
 *
 * Use this resolver with useForm hook for automatic validation.
 *
 * @example
 * ```typescript
 * import { useForm } from 'react-hook-form'
 * import { taskFormResolver, type TaskFormData } from './task.schema'
 *
 * function TaskForm() {
 *   const form = useForm<TaskFormData>({
 *     resolver: taskFormResolver,
 *     defaultValues: {
 *       title: '',
 *       description: '',
 *       priority: 'none',
 *       completed: false,
 *     },
 *   })
 *
 *   const onSubmit = (data: TaskFormData) => {
 *     console.log('Validated data:', data)
 *   }
 *
 *   return (
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <input {...form.register('title')} />
 *       {form.formState.errors.title && (
 *         <span>{form.formState.errors.title.message}</span>
 *       )}
 *     </form>
 *   )
 * }
 * ```
 */
export const taskFormResolver = zodResolver(taskFormSchema)

/**
 * Pre-configured zodResolver for task creation forms.
 *
 * Functionally identical to taskFormResolver, but semantically
 * represents task creation context.
 */
export const taskDraftResolver = zodResolver(taskDraftSchema)

/**
 * Pre-configured zodResolver for task update forms.
 *
 * Use for edit forms where all fields are optional.
 */
export const taskUpdateResolver = zodResolver(taskUpdateSchema)
