/**
 * Task Schema Validation Tests
 *
 * Comprehensive test suite for task validation schemas with focus on
 * dd-mm-YYYY date format validation and past date prevention.
 *
 * @module features/tasks/validation/__tests__/task.schema.test
 */

import { describe, expect, it } from 'vitest'
import {
  taskDraftSchema,
  taskFormSchema,
  taskUpdateSchema,
} from '../task.schema'

describe('Task Schema Validation', () => {
  describe('taskFormSchema', () => {
    describe('title validation', () => {
      it('should accept valid titles', () => {
        const result = taskFormSchema.safeParse({
          title: 'Valid Task Title',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
      })

      it('should trim whitespace from titles', () => {
        const result = taskFormSchema.safeParse({
          title: '  Trimmed Title  ',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.title).toBe('Trimmed Title')
        }
      })

      it('should reject empty titles', () => {
        const result = taskFormSchema.safeParse({
          title: '',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Title cannot be empty')
        }
      })

      it('should reject titles exceeding max length', () => {
        const result = taskFormSchema.safeParse({
          title: 'a'.repeat(256),
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            'cannot exceed 255 characters'
          )
        }
      })
    })

    describe('description validation', () => {
      it('should accept valid descriptions', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          description: 'A detailed description of the task',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
      })

      it('should accept undefined descriptions', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
      })

      it('should trim descriptions', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          description: '  Trimmed description  ',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.description).toBe('Trimmed description')
        }
      })

      it('should reject descriptions exceeding max length', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          description: 'a'.repeat(5001),
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            'cannot exceed 5000 characters'
          )
        }
      })
    })

    describe('priority validation', () => {
      it.each(['none', 'low', 'medium', 'high'] as const)(
        'should accept priority: %s',
        priority => {
          const result = taskFormSchema.safeParse({
            title: 'Task',
            priority,
            completed: false,
          })
          expect(result.success).toBe(true)
        }
      )

      it('should default to "none" if not provided', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          completed: false,
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.priority).toBe('none')
        }
      })

      it('should reject invalid priority values', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'urgent',
          completed: false,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid ')
        }
      })
    })

    describe('completed validation', () => {
      it('should accept true/false values', () => {
        const resultTrue = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: true,
        })
        const resultFalse = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
        })
        expect(resultTrue.success).toBe(true)
        expect(resultFalse.success).toBe(true)
      })

      it('should default to false if not provided', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.completed).toBe(false)
        }
      })

      it('should reject non-boolean values', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: 'yes',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid input')
        }
      })
    })

    describe('dueDate validation - format', () => {
      it('should accept valid dd-mm-YYYY dates', () => {
        // Generate dynamic dates to ensure tests work on any day
        const today = new Date()

        // Tomorrow
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = `${String(tomorrow.getDate()).padStart(2, '0')}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${tomorrow.getFullYear()}`

        // Next year (same day/month)
        const nextYear = new Date(today)
        nextYear.setFullYear(nextYear.getFullYear() + 1)
        const nextYearStr = `${String(nextYear.getDate()).padStart(2, '0')}-${String(nextYear.getMonth() + 1).padStart(2, '0')}-${nextYear.getFullYear()}`

        // End of current year
        const endOfYear = new Date(today.getFullYear(), 11, 31) // Dec 31
        const endOfYearStr = `31-12-${endOfYear.getFullYear()}`

        // Leap year date (Feb 29, 2028 - guaranteed future leap year)
        const leapYear = new Date(2028, 1, 29) // Feb 29, 2028
        const leapYearStr = `29-02-${leapYear.getFullYear()}`

        const validDates = [
          tomorrowStr, // Tomorrow (dynamic)
          nextYearStr, // Next year (dynamic)
          endOfYearStr, // End of this year (dynamic)
          leapYearStr, // Leap year (Feb 29, 2028)
        ]

        validDates.forEach(dueDate => {
          const result = taskFormSchema.safeParse({
            title: 'Task',
            priority: 'none',
            completed: false,
            dueDate,
          })
          expect(result.success).toBe(true)
        })
      })

      it('should accept undefined dueDate', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
        })
        expect(result.success).toBe(true)
      })

      it('should transform empty string to undefined', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: '',
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.dueDate).toBeUndefined()
        }
      })

      it('should reject ISO 8601 format dates', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: '2025-11-20T00:00:00Z',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('dd-mm-YYYY format')
        }
      })

      it('should reject YYYY-MM-DD format dates', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: '2025-11-20',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('dd-mm-YYYY format')
        }
      })

      it('should reject MM-DD-YYYY format dates', () => {
        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: '11-20-2025',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('dd-mm-YYYY format')
        }
      })

      it('should reject invalid day values', () => {
        const invalidDates = [
          '32-01-2025', // Day > 31
          '00-01-2025', // Day = 0
          '31-02-2025', // Feb 31st
          '31-04-2025', // April 31st
          '29-02-2025', // Non-leap year Feb 29th
        ]

        invalidDates.forEach(dueDate => {
          const result = taskFormSchema.safeParse({
            title: 'Task',
            priority: 'none',
            completed: false,
            dueDate,
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain(
              'dd-mm-YYYY format'
            )
          }
        })
      })

      it('should reject invalid month values', () => {
        const invalidDates = [
          '20-00-2025', // Month = 0
          '20-13-2025', // Month = 13
          '20-99-2025', // Month = 99
        ]

        invalidDates.forEach(dueDate => {
          const result = taskFormSchema.safeParse({
            title: 'Task',
            priority: 'none',
            completed: false,
            dueDate,
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues[0].message).toContain(
              'dd-mm-YYYY format'
            )
          }
        })
      })

      it('should validate leap years correctly', () => {
        // Find next future leap year
        const today = new Date()
        let futureLeapYear = today.getFullYear() + 1

        // Find the next leap year from current year
        while (!isLeapYear(futureLeapYear)) {
          futureLeapYear++
        }

        // Find next non-leap year
        let futureNonLeapYear = futureLeapYear + 1
        while (isLeapYear(futureNonLeapYear)) {
          futureNonLeapYear++
        }

        // Valid leap year (Feb 29 in future leap year)
        const validLeap = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: `29-02-${futureLeapYear}`,
        })
        expect(validLeap.success).toBe(true)

        // Invalid non-leap year (Feb 29 in future non-leap year)
        const invalidLeap = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: `29-02-${futureNonLeapYear}`,
        })
        expect(invalidLeap.success).toBe(false)
      })
    })

    // Helper function to check if a year is a leap year
    function isLeapYear(year: number): boolean {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    }

    describe('dueDate validation - past dates', () => {
      it('should reject past dates', () => {
        // Create a date well in the past
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        const day = String(pastDate.getDate()).padStart(2, '0')
        const month = String(pastDate.getMonth() + 1).padStart(2, '0')
        const year = pastDate.getFullYear()
        const pastDateStr = `${day}-${month}-${year}`

        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: pastDateStr,
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Due date cannot be in the past'
          )
        }
      })

      it('should accept today as valid date', () => {
        const today = new Date()
        const day = String(today.getDate()).padStart(2, '0')
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const year = today.getFullYear()
        const todayStr = `${day}-${month}-${year}`

        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: todayStr,
        })
        expect(result.success).toBe(true)
      })

      it('should accept future dates', () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)
        const day = String(futureDate.getDate()).padStart(2, '0')
        const month = String(futureDate.getMonth() + 1).padStart(2, '0')
        const year = futureDate.getFullYear()
        const futureDateStr = `${day}-${month}-${year}`

        const result = taskFormSchema.safeParse({
          title: 'Task',
          priority: 'none',
          completed: false,
          dueDate: futureDateStr,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('taskDraftSchema', () => {
    it('should validate new task creation payloads', () => {
      // Generate dynamic future date
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 2) // 2 months from now
      const futureDateStr = `${String(futureDate.getDate()).padStart(2, '0')}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${futureDate.getFullYear()}`

      const result = taskDraftSchema.safeParse({
        title: 'New Task',
        description: 'Task details',
        priority: 'medium',
        completed: false,
        dueDate: futureDateStr,
      })
      expect(result.success).toBe(true)
    })

    it('should apply same validation as taskFormSchema', () => {
      const invalidResult = taskDraftSchema.safeParse({
        title: '',
        priority: 'invalid',
        dueDate: '2025-11-20',
      })
      expect(invalidResult.success).toBe(false)
    })
  })

  describe('taskUpdateSchema', () => {
    it('should allow partial updates', () => {
      const result = taskUpdateSchema.safeParse({
        completed: true,
      })
      expect(result.success).toBe(true)
    })

    it('should validate individual fields when provided', () => {
      const result = taskUpdateSchema.safeParse({
        title: '',
        priority: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should accept all fields as optional', () => {
      const result = taskUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('comprehensive validation scenarios', () => {
    it('should validate minimal valid task', () => {
      const result = taskFormSchema.safeParse({
        title: 'T',
        priority: 'none',
        completed: false,
      })
      expect(result.success).toBe(true)
    })

    it('should validate maximum valid task', () => {
      const result = taskFormSchema.safeParse({
        title: 'a'.repeat(255),
        description: 'b'.repeat(5000),
        priority: 'high',
        completed: true,
        dueDate: '31-12-2099',
      })
      expect(result.success).toBe(true)
    })

    it('should collect multiple validation errors', () => {
      const result = taskFormSchema.safeParse({
        title: '',
        description: 'a'.repeat(5001),
        priority: 'invalid',
        completed: 'not-boolean',
        dueDate: 'invalid-date',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1)
      }
    })
  })
})
