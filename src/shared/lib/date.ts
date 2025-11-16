/**
 * Date utility functions for todo application
 * All functions use native JavaScript Date APIs (no external dependencies)
 */

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "tomorrow")
 * @param date - The date to format
 * @param baseDate - The date to compare against (defaults to now)
 * @returns Relative time string
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
 * Format a date as a standard date string (e.g., "Jan 15, 2025")
 * @param date - The date to format
 * @returns Formatted date string
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
 * Format a date with time (e.g., "Jan 15, 2025 at 3:30 PM")
 * @param date - The date to format
 * @returns Formatted date and time string
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

/**
 * Parse a date string and validate it
 * @param dateString - The date string to parse
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null

  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Check if a date is valid
 * @param date - The date to validate
 * @returns True if the date is valid
 */
export const isValidDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return !isNaN(targetDate.getTime())
}

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @param baseDate - The date to compare against (defaults to now)
 * @returns True if the date is in the past
 */
export const isPast = (date: Date | string, baseDate: Date = new Date()): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.getTime() < baseDate.getTime()
}

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @param baseDate - The date to compare against (defaults to now)
 * @returns True if the date is in the future
 */
export const isFuture = (date: Date | string, baseDate: Date = new Date()): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return targetDate.getTime() > baseDate.getTime()
}

/**
 * Check if a date is today
 * @param date - The date to check
 * @param baseDate - The date to compare against (defaults to now)
 * @returns True if the date is today
 */
export const isToday = (date: Date | string, baseDate: Date = new Date()): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  return (
    targetDate.getDate() === baseDate.getDate() &&
    targetDate.getMonth() === baseDate.getMonth() &&
    targetDate.getFullYear() === baseDate.getFullYear()
  )
}

/**
 * Check if a date is tomorrow
 * @param date - The date to check
 * @param baseDate - The date to compare against (defaults to now)
 * @returns True if the date is tomorrow
 */
export const isTomorrow = (date: Date | string, baseDate: Date = new Date()): boolean => {
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
 * Check if a date is yesterday
 * @param date - The date to check
 * @param baseDate - The date to compare against (defaults to now)
 * @returns True if the date is yesterday
 */
export const isYesterday = (date: Date | string, baseDate: Date = new Date()): boolean => {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const yesterday = new Date(baseDate)
  yesterday.setDate(yesterday.getDate() - 1)

  return (
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Get the start of day (midnight) for a given date
 * @param date - The date to process (defaults to now)
 * @returns Date object set to midnight
 */
export const startOfDay = (date: Date | string = new Date()): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  return targetDate
}

/**
 * Get the end of day (23:59:59.999) for a given date
 * @param date - The date to process (defaults to now)
 * @returns Date object set to end of day
 */
export const endOfDay = (date: Date | string = new Date()): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setHours(23, 59, 59, 999)
  return targetDate
}

/**
 * Add days to a date
 * @param date - The starting date
 * @param days - Number of days to add (negative to subtract)
 * @returns New date with days added
 */
export const addDays = (date: Date | string, days: number): Date => {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date)
  targetDate.setDate(targetDate.getDate() + days)
  return targetDate
}

/**
 * Get the difference between two dates in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the dates
 */
export const diffInDays = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffMs = d2.getTime() - d1.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
