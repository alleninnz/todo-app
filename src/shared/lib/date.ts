/**
 * Date Utility Functions
 *
 * Comprehensive date manipulation and formatting utilities for the todo application.
 * All functions use native JavaScript Date APIs without external dependencies.
 *
 * @module shared/lib/date
 */

/* ==================== Formatting Functions ==================== */

/**
 * Formats a date as a human-readable relative time string.
 *
 * Automatically chooses appropriate format based on time difference:
 * - Within 1 hour: minutes ("5 minutes ago")
 * - Within 24 hours: hours ("3 hours ago")
 * - Within 7 days: days ("2 days ago")
 * - Beyond 7 days: full date ("Jan 15, 2025")
 *
 * @param date - Date to format (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns Human-readable relative time string
 *
 * @example
 * ```typescript
 * // Assuming current time is Jan 15, 2025 10:00 AM
 * formatRelativeTime(new Date('2025-01-15T09:30:00')) // "30 minutes ago"
 * formatRelativeTime(new Date('2025-01-15T07:00:00')) // "3 hours ago"
 * formatRelativeTime(new Date('2025-01-14T10:00:00')) // "yesterday"
 * formatRelativeTime(new Date('2025-01-13T10:00:00')) // "2 days ago"
 * formatRelativeTime(new Date('2025-01-16T10:00:00')) // "tomorrow"
 * formatRelativeTime(new Date('2025-01-20T10:00:00')) // "in 5 days"
 * ```
 */
export const formatRelativeTime = (
  date: Date | string,
  baseDate: Date = new Date()
): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffMs = targetDate.getTime() - baseDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Past times
  if (diffMs < 0) {
    const absDays = Math.abs(diffDays)
    const absHours = Math.abs(diffHours)
    const absMinutes = Math.abs(diffMinutes)

    if (absDays > 7) {
      return formatDate(targetDate)
    }
    if (absDays > 1) {
      return `${absDays} days ago`
    }
    if (absDays === 1) {
      return 'yesterday'
    }
    if (absHours > 1) {
      return `${absHours} hours ago`
    }
    if (absMinutes > 1) {
      return `${absMinutes} minutes ago`
    }
    return 'just now'
  }

  // Future times
  if (diffDays > 7) {
    return formatDate(targetDate)
  }
  if (diffDays > 1) {
    return `in ${diffDays} days`
  }
  if (diffDays === 1) {
    return 'tomorrow'
  }
  if (diffHours > 1) {
    return `in ${diffHours} hours`
  }
  if (diffMinutes > 1) {
    return `in ${diffMinutes} minutes`
  }
  return 'soon'
}

/**
 * Formats a date as a localized short date string.
 *
 * Uses US locale format: abbreviated month, day, and full year.
 *
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string in "MMM DD, YYYY" format
 *
 * @example
 * ```typescript
 * formatDate(new Date('2025-01-15')) // "Jan 15, 2025"
 * formatDate('2025-12-31T00:00:00Z') // "Dec 31, 2025"
 * formatDate(new Date('2025-07-04')) // "Jul 4, 2025"
 * ```
 */
export const formatDate = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Formats a date with time in a user-friendly format.
 *
 * Combines localized date and 12-hour time format.
 *
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted string in "MMM DD, YYYY at HH:MM AM/PM" format
 *
 * @example
 * ```typescript
 * formatDateTime(new Date('2025-01-15T15:30:00')) // "Jan 15, 2025 at 3:30 PM"
 * formatDateTime(new Date('2025-12-31T09:15:00')) // "Dec 31, 2025 at 9:15 AM"
 * formatDateTime('2025-07-04T00:00:00Z') // "Jul 4, 2025 at 12:00 AM"
 * ```
 */
export const formatDateTime = (date: Date | string): string => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const dateStr = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = targetDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr} at ${timeStr}`
}

/* ==================== Parsing & Validation Functions ==================== */

/**
 * Parses a date string and validates it.
 *
 * Attempts to parse any valid date string format and returns null for invalid inputs.
 *
 * @param dateString - Date string to parse
 * @returns Parsed Date object if valid, null otherwise
 *
 * @example
 * ```typescript
 * parseDate('2025-01-15') // Date object
 * parseDate('2025-01-15T10:00:00Z') // Date object
 * parseDate('invalid') // null
 * parseDate('') // null
 * ```
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null

  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Validates if a date is valid.
 *
 * Checks if the provided date (string or Date object) represents a valid date.
 * Returns false for null, undefined, or invalid dates.
 *
 * @param date - Date to validate (Date object, string, null, or undefined)
 * @returns true if date is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidDate(new Date('2025-01-15')) // true
 * isValidDate('2025-01-15') // true
 * isValidDate('invalid') // false
 * isValidDate(null) // false
 * isValidDate(undefined) // false
 * ```
 */
export const isValidDate = (
  date: Date | string | null | undefined
): boolean => {
  if (!date) return false
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return !isNaN(targetDate.getTime())
}

/* ==================== Date Comparison Functions ==================== */

/**
 * Checks if a date is in the past.
 *
 * Compares timestamps to determine if the date is before the base date.
 *
 * @param date - Date to check (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns true if date is in the past, false otherwise
 *
 * @example
 * ```typescript
 * // Assuming current time is Jan 15, 2025
 * isPast(new Date('2025-01-14')) // true
 * isPast(new Date('2025-01-16')) // false
 * isPast('2024-12-31T00:00:00Z') // true
 * ```
 */
export const isPast = (
  date: Date | string,
  baseDate: Date = new Date()
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.getTime() < baseDate.getTime()
}

/**
 * Checks if a date is in the future.
 *
 * Compares timestamps to determine if the date is after the base date.
 *
 * @param date - Date to check (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns true if date is in the future, false otherwise
 *
 * @example
 * ```typescript
 * // Assuming current time is Jan 15, 2025
 * isFuture(new Date('2025-01-16')) // true
 * isFuture(new Date('2025-01-14')) // false
 * isFuture('2026-01-01T00:00:00Z') // true
 * ```
 */
export const isFuture = (
  date: Date | string,
  baseDate: Date = new Date()
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.getTime() > baseDate.getTime()
}

/**
 * Checks if a date is today.
 *
 * Compares year, month, and day to determine if the date matches the base date.
 * Ignores time component.
 *
 * @param date - Date to check (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns true if date is today, false otherwise
 *
 * @example
 * ```typescript
 * // Assuming current date is Jan 15, 2025
 * isToday(new Date('2025-01-15T10:00:00')) // true
 * isToday(new Date('2025-01-15T23:59:59')) // true
 * isToday(new Date('2025-01-14')) // false
 * isToday(new Date('2025-01-16')) // false
 * ```
 */
export const isToday = (
  date: Date | string,
  baseDate: Date = new Date()
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return (
    targetDate.getDate() === baseDate.getDate() &&
    targetDate.getMonth() === baseDate.getMonth() &&
    targetDate.getFullYear() === baseDate.getFullYear()
  )
}

/**
 * Checks if a date is tomorrow.
 *
 * Compares year, month, and day to determine if the date is one day after the base date.
 * Ignores time component.
 *
 * @param date - Date to check (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns true if date is tomorrow, false otherwise
 *
 * @example
 * ```typescript
 * // Assuming current date is Jan 15, 2025
 * isTomorrow(new Date('2025-01-16T00:00:00')) // true
 * isTomorrow(new Date('2025-01-16T23:59:59')) // true
 * isTomorrow(new Date('2025-01-15')) // false
 * isTomorrow(new Date('2025-01-17')) // false
 * ```
 */
export const isTomorrow = (
  date: Date | string,
  baseDate: Date = new Date()
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const tomorrow = new Date(baseDate)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    targetDate.getDate() === tomorrow.getDate() &&
    targetDate.getMonth() === tomorrow.getMonth() &&
    targetDate.getFullYear() === tomorrow.getFullYear()
  )
}

/**
 * Checks if a date is yesterday.
 *
 * Compares year, month, and day to determine if the date is one day before the base date.
 * Ignores time component.
 *
 * @param date - Date to check (Date object or ISO string)
 * @param baseDate - Reference date for comparison (defaults to now)
 * @returns true if date is yesterday, false otherwise
 *
 * @example
 * ```typescript
 * // Assuming current date is Jan 15, 2025
 * isYesterday(new Date('2025-01-14T00:00:00')) // true
 * isYesterday(new Date('2025-01-14T23:59:59')) // true
 * isYesterday(new Date('2025-01-15')) // false
 * isYesterday(new Date('2025-01-13')) // false
 * ```
 */
export const isYesterday = (
  date: Date | string,
  baseDate: Date = new Date()
): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date(baseDate)
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear()
  )
}

/* ==================== Date Manipulation Functions ==================== */

/**
 * Gets the start of day (midnight) for a given date.
 *
 * Sets time to 00:00:00.000 in local timezone.
 *
 * @param date - Date to process (defaults to now)
 * @returns New Date object set to midnight (00:00:00.000)
 *
 * @example
 * ```typescript
 * const date = new Date('2025-01-15T15:30:45.123')
 * startOfDay(date) // Date: 2025-01-15T00:00:00.000
 * startOfDay() // Today at 00:00:00.000
 * ```
 */
export const startOfDay = (date: Date | string = new Date()): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  return targetDate
}

/**
 * Gets the end of day (last millisecond) for a given date.
 *
 * Sets time to 23:59:59.999 in local timezone.
 *
 * @param date - Date to process (defaults to now)
 * @returns New Date object set to end of day (23:59:59.999)
 *
 * @example
 * ```typescript
 * const date = new Date('2025-01-15T15:30:45.123')
 * endOfDay(date) // Date: 2025-01-15T23:59:59.999
 * endOfDay() // Today at 23:59:59.999
 * ```
 */
export const endOfDay = (date: Date | string = new Date()): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setHours(23, 59, 59, 999)
  return targetDate
}

/**
 * Adds or subtracts days from a date.
 *
 * Creates a new Date object with the specified number of days added.
 * Use negative values to subtract days.
 *
 * @param date - Starting date (Date object or ISO string)
 * @param days - Number of days to add (negative to subtract)
 * @returns New Date object with days added
 *
 * @example
 * ```typescript
 * const date = new Date('2025-01-15')
 * addDays(date, 5) // Date: 2025-01-20
 * addDays(date, -3) // Date: 2025-01-12
 * addDays('2025-01-31', 1) // Date: 2025-02-01 (handles month overflow)
 * ```
 */
export const addDays = (date: Date | string, days: number): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setDate(targetDate.getDate() + days)
  return targetDate
}

/**
 * Calculates the difference between two dates in days.
 *
 * Returns the number of full days between two dates.
 * Result is positive if date2 is after date1, negative if before.
 *
 * @param date1 - First date (Date object or ISO string)
 * @param date2 - Second date (Date object or ISO string)
 * @returns Number of days between dates (can be negative)
 *
 * @example
 * ```typescript
 * const start = new Date('2025-01-15')
 * const end = new Date('2025-01-20')
 * diffInDays(start, end) // 5
 * diffInDays(end, start) // -5
 * diffInDays('2025-01-15', '2025-01-15') // 0
 * ```
 */
export const diffInDays = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffMs = d2.getTime() - d1.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/* ==================== dd-mm-YYYY Format Validation ==================== */

/**
 * Parses a date string in dd-mm-YYYY format to a Date object.
 *
 * @param dateStr - Date string in dd-mm-YYYY format
 * @returns Date object if valid, null otherwise
 *
 * @example
 * ```typescript
 * parseDateString('20-11-2025') // Date object for Nov 20, 2025
 * parseDateString('32-01-2025') // null (invalid day)
 * parseDateString('29-02-2024') // Date object (valid leap year)
 * parseDateString('29-02-2025') // null (invalid - not leap year)
 * ```
 */
export function parseDateString(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)

  // Create date (month is 0-indexed in JavaScript Date)
  const date = new Date(year, month - 1, day)

  // Validate the date components match (catches invalid dates like 32-01-2025)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null
  }

  return date
}

/**
 * Validates if a string matches dd-mm-YYYY format and represents a valid date.
 *
 * @param dateStr - String to validate
 * @returns true if valid dd-mm-YYYY date, false otherwise
 *
 * @example
 * ```typescript
 * isValidDateFormat('20-11-2025') // true
 * isValidDateFormat('01-01-2026') // true
 * isValidDateFormat('29-02-2024') // true (leap year)
 * isValidDateFormat('2025-11-20') // false (wrong format)
 * isValidDateFormat('32-01-2025') // false (invalid day)
 * isValidDateFormat('20-13-2025') // false (invalid month)
 * isValidDateFormat('29-02-2025') // false (not leap year)
 * ```
 */
export function isValidDateFormat(dateStr: string): boolean {
  // Check format pattern
  const formatRegex = /^\d{2}-\d{2}-\d{4}$/
  if (!formatRegex.test(dateStr)) return false

  // Parse and validate actual date
  const date = parseDateString(dateStr)
  return date !== null
}

/**
 * Checks if a date string represents a past date.
 *
 * @param dateStr - Date string in dd-mm-YYYY format
 * @returns true if date is in the past, false otherwise
 *
 * @remarks
 * Compares dates at start of day (00:00:00) in local timezone.
 * Today's date is considered valid (not past).
 *
 * @example
 * ```typescript
 * // Assuming today is 18-11-2025
 * isPastDate('15-11-2025') // true
 * isPastDate('18-11-2025') // false (today is valid)
 * isPastDate('20-11-2025') // false
 * ```
 */
export function isPastDate(dateStr: string): boolean {
  const date = parseDateString(dateStr)
  if (!date) return false

  // Get today's date at start of day for fair comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Set parsed date to start of day
  date.setHours(0, 0, 0, 0)

  return date < today
}
