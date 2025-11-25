/**
 * Format utility functions for todo application
 * Handles formatting of priorities, status, numbers, and text
 */

/**
 * Priority level type
 */
export type Priority = 'none' | 'low' | 'medium' | 'high'

/**
 * Task status type
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived'

/**
 * Format a priority level for display
 * @param priority - The priority level
 * @returns Formatted priority string
 */
export const formatPriority = (priority: Priority): string => {
  const priorityMap: Record<Priority, string> = {
    none: 'No Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  }
  return priorityMap[priority] || 'No Priority'
}

/**
 * Get a priority color (for use with MUI or styling)
 * @param priority - The priority level
 * @returns Color string (MUI color or hex)
 */
export const getPriorityColor = (
  priority: Priority
): 'default' | 'info' | 'warning' | 'error' => {
  const colorMap: Record<Priority, 'default' | 'info' | 'warning' | 'error'> = {
    none: 'default',
    low: 'info',
    medium: 'warning',
    high: 'error',
  }
  return colorMap[priority] || 'default'
}

/**
 * Format a task status for display
 * @param status - The task status
 * @returns Formatted status string
 */
export const formatTaskStatus = (status: TaskStatus): string => {
  const statusMap: Record<TaskStatus, string> = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
  }
  return statusMap[status] || 'Pending'
}

/**
 * Get a status color (for use with MUI or styling)
 * @param status - The task status
 * @returns Color string
 */
export const getStatusColor = (
  status: TaskStatus
): 'default' | 'primary' | 'success' | 'secondary' => {
  const colorMap: Record<
    TaskStatus,
    'default' | 'primary' | 'success' | 'secondary'
  > = {
    pending: 'default',
    'in-progress': 'primary',
    completed: 'success',
    archived: 'secondary',
  }
  return colorMap[status] || 'default'
}

/**
 * Format a number as a count (e.g., "5 tasks", "1 task")
 * @param count - The number to format
 * @param singular - The singular form of the noun
 * @param plural - The plural form of the noun (optional, defaults to singular + 's')
 * @returns Formatted count string
 */
export const formatCount = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const noun = count === 1 ? singular : plural || `${singular}s`
  return `${count} ${noun}`
}

/**
 * Format a percentage
 * @param value - The value to format
 * @param total - The total value
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "75%")
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals: number = 0
): string => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param ellipsis - The ellipsis string (default: '...')
 * @returns Truncated text
 */
export const truncate = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Capitalize the first letter of a string
 * @param text - The text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Format a list of items with proper separators
 * @param items - Array of items to format
 * @param conjunction - The conjunction to use (default: 'and')
 * @returns Formatted list string (e.g., "apples, oranges, and bananas")
 */
export const formatList = (
  items: string[],
  conjunction: string = 'and'
): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`

  const allButLast = items.slice(0, -1).join(', ')
  const last = items[items.length - 1]
  return `${allButLast}, ${conjunction} ${last}`
}

/**
 * Format a file size in human-readable format
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format a duration in milliseconds to human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Format a number with thousands separators
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US')
}

/**
 * Pluralize a word based on count
 * @param count - The count
 * @param singular - The singular form
 * @param plural - The plural form (optional, defaults to singular + 's')
 * @returns The appropriate form of the word
 */
export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  return count === 1 ? singular : plural || `${singular}s`
}
