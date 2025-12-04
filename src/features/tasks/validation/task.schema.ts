/**
 * Task Schemas
 *
 * This module defines Zod schemas for task validation, covering creation,
 * updates, and form interactions.
 *
 * @module features/tasks/validation/task.schema
 */
import { z } from 'zod'

const dueDateSchema = z
  .string()
  .optional()
  .transform(val => (val === '' || val === null ? undefined : val))
  .refine(
    val => {
      if (!val) return true // Allow undefined
      const regex = /^(\d{2})-(\d{2})-(\d{4})$/
      if (!regex.test(val)) return false
      const [day, month, year] = val.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      )
    },
    {
      message: 'Date must be in dd-mm-YYYY format and be a valid date',
    }
  )
  .refine(
    val => {
      if (!val) return true // Allow undefined
      const [day, month, year] = val.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    },
    {
      message: 'Due date cannot be in the past',
    }
  )

export const taskFormSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  priority: z
    .enum(['none', 'low', 'medium', 'high'], {
      errorMap: () => ({
        message: 'Priority must be one of none, low, medium, or high',
      }),
    })
    .default('none'),
  completed: z
    .boolean({ invalid_type_error: 'Completed must be true or false' })
    .default(false),
  dueDate: dueDateSchema,
})

export const taskDraftSchema = taskFormSchema
export const taskUpdateSchema = taskFormSchema.partial()
