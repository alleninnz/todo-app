import { describe, it, expect } from 'vitest'
import {
  formatPriority,
  getPriorityColor,
  formatTaskStatus,
  getStatusColor,
  formatCount,
  formatPercentage,
  truncate,
  capitalize,
  formatList,
  formatFileSize,
  formatDuration,
  formatNumber,
  pluralize,
  type Priority,
  type TaskStatus,
} from '../format'

describe('format utilities', () => {
  describe('formatPriority', () => {
    it('should format "none" priority', () => {
      expect(formatPriority('none')).toBe('No Priority')
    })

    it('should format "low" priority', () => {
      expect(formatPriority('low')).toBe('Low')
    })

    it('should format "medium" priority', () => {
      expect(formatPriority('medium')).toBe('Medium')
    })

    it('should format "high" priority', () => {
      expect(formatPriority('high')).toBe('High')
    })

    it('should handle invalid priority with fallback', () => {
      expect(formatPriority('invalid' as Priority)).toBe('No Priority')
    })
  })

  describe('getPriorityColor', () => {
    it('should return "default" for "none" priority', () => {
      expect(getPriorityColor('none')).toBe('default')
    })

    it('should return "info" for "low" priority', () => {
      expect(getPriorityColor('low')).toBe('info')
    })

    it('should return "warning" for "medium" priority', () => {
      expect(getPriorityColor('medium')).toBe('warning')
    })

    it('should return "error" for "high" priority', () => {
      expect(getPriorityColor('high')).toBe('error')
    })

    it('should handle invalid priority with fallback', () => {
      expect(getPriorityColor('invalid' as Priority)).toBe('default')
    })
  })

  describe('formatTaskStatus', () => {
    it('should format "pending" status', () => {
      expect(formatTaskStatus('pending')).toBe('Pending')
    })

    it('should format "in-progress" status', () => {
      expect(formatTaskStatus('in-progress')).toBe('In Progress')
    })

    it('should format "completed" status', () => {
      expect(formatTaskStatus('completed')).toBe('Completed')
    })

    it('should format "archived" status', () => {
      expect(formatTaskStatus('archived')).toBe('Archived')
    })

    it('should handle invalid status with fallback', () => {
      expect(formatTaskStatus('invalid' as TaskStatus)).toBe('Pending')
    })
  })

  describe('getStatusColor', () => {
    it('should return "default" for "pending" status', () => {
      expect(getStatusColor('pending')).toBe('default')
    })

    it('should return "primary" for "in-progress" status', () => {
      expect(getStatusColor('in-progress')).toBe('primary')
    })

    it('should return "success" for "completed" status', () => {
      expect(getStatusColor('completed')).toBe('success')
    })

    it('should return "secondary" for "archived" status', () => {
      expect(getStatusColor('archived')).toBe('secondary')
    })

    it('should handle invalid status with fallback', () => {
      expect(getStatusColor('invalid' as TaskStatus)).toBe('default')
    })
  })

  describe('formatCount', () => {
    it('should format count with singular noun when count is 1', () => {
      expect(formatCount(1, 'task')).toBe('1 task')
    })

    it('should format count with plural noun when count is not 1', () => {
      expect(formatCount(5, 'task')).toBe('5 tasks')
      expect(formatCount(0, 'task')).toBe('0 tasks')
      expect(formatCount(2, 'task')).toBe('2 tasks')
    })

    it('should use custom plural form when provided', () => {
      expect(formatCount(1, 'person', 'people')).toBe('1 person')
      expect(formatCount(3, 'person', 'people')).toBe('3 people')
    })

    it('should handle irregular plurals', () => {
      expect(formatCount(1, 'child', 'children')).toBe('1 child')
      expect(formatCount(2, 'child', 'children')).toBe('2 children')
    })

    it('should handle zero count', () => {
      expect(formatCount(0, 'item')).toBe('0 items')
    })

    it('should handle negative counts', () => {
      expect(formatCount(-1, 'item')).toBe('-1 items')
      expect(formatCount(-5, 'item')).toBe('-5 items')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default 0 decimals', () => {
      expect(formatPercentage(75, 100)).toBe('75%')
      expect(formatPercentage(50, 100)).toBe('50%')
    })

    it('should format percentage with specified decimals', () => {
      expect(formatPercentage(75.5, 100, 1)).toBe('75.5%')
      expect(formatPercentage(75.555, 100, 2)).toBe('75.56%')
      expect(formatPercentage(75.555, 100, 3)).toBe('75.555%')
    })

    it('should round percentages correctly', () => {
      expect(formatPercentage(1, 3, 2)).toBe('33.33%')
      expect(formatPercentage(2, 3, 2)).toBe('66.67%')
    })

    it('should handle 0% correctly', () => {
      expect(formatPercentage(0, 100)).toBe('0%')
    })

    it('should handle 100% correctly', () => {
      expect(formatPercentage(100, 100)).toBe('100%')
    })

    it('should handle total of 0 by returning "0%"', () => {
      expect(formatPercentage(50, 0)).toBe('0%')
      expect(formatPercentage(0, 0)).toBe('0%')
    })

    it('should handle values greater than total', () => {
      expect(formatPercentage(150, 100)).toBe('150%')
    })

    it('should handle negative values', () => {
      expect(formatPercentage(-25, 100)).toBe('-25%')
    })
  })

  describe('truncate', () => {
    it('should not truncate text shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should not truncate text equal to maxLength', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should truncate text longer than maxLength', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should use custom ellipsis', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
      expect(truncate('Hello World', 10, ' [more]')).toBe('Hel [more]')
    })

    it('should handle default ellipsis "..."', () => {
      expect(truncate('This is a very long text', 10)).toBe('This is...')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })

    it('should handle single character', () => {
      expect(truncate('H', 1)).toBe('H')
      expect(truncate('H', 0)).toBe('...')
    })

    it('should account for ellipsis length in truncation', () => {
      const result = truncate('Hello World', 8) // 8 - 3 (ellipsis) = 5 chars + "..."
      expect(result.length).toBe(8)
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter of lowercase word', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should keep first letter capitalized if already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    it('should capitalize only the first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world')
    })

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H')
      expect(capitalize('H')).toBe('H')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle strings with numbers', () => {
      expect(capitalize('123abc')).toBe('123abc')
    })

    it('should handle strings starting with special characters', () => {
      expect(capitalize('!hello')).toBe('!hello')
    })
  })

  describe('formatList', () => {
    it('should return empty string for empty array', () => {
      expect(formatList([])).toBe('')
    })

    it('should return single item for array with one element', () => {
      expect(formatList(['apple'])).toBe('apple')
    })

    it('should format two items with "and"', () => {
      expect(formatList(['apple', 'orange'])).toBe('apple and orange')
    })

    it('should format three items with commas and "and"', () => {
      expect(formatList(['apple', 'orange', 'banana'])).toBe(
        'apple, orange, and banana'
      )
    })

    it('should format multiple items with Oxford comma', () => {
      expect(formatList(['apple', 'orange', 'banana', 'grape'])).toBe(
        'apple, orange, banana, and grape'
      )
    })

    it('should use custom conjunction', () => {
      expect(formatList(['apple', 'orange'], 'or')).toBe('apple or orange')
      expect(formatList(['apple', 'orange', 'banana'], 'or')).toBe(
        'apple, orange, or banana'
      )
    })

    it('should handle longer lists', () => {
      const items = ['one', 'two', 'three', 'four', 'five']
      expect(formatList(items)).toBe('one, two, three, four, and five')
    })
  })

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('should format bytes (< 1024)', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(1024 * 1024 * 1024 * 1.5)).toBe('1.5 GB')
    })

    it('should format terabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
      expect(formatFileSize(1024 * 1024 * 1024 * 1024 * 2.5)).toBe('2.5 TB')
    })

    it('should use custom decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB')
      expect(formatFileSize(1536, 1)).toBe('1.5 KB')
      expect(formatFileSize(1536, 3)).toBe('1.5 KB')
    })

    it('should handle very small decimals', () => {
      expect(formatFileSize(1025, 2)).toBe('1 KB')
    })

    it('should round appropriately', () => {
      expect(formatFileSize(1535, 2)).toBe('1.5 KB')
      expect(formatFileSize(1536, 2)).toBe('1.5 KB')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(5000)).toBe('5s')
      expect(formatDuration(30000)).toBe('30s')
    })

    it('should format minutes and seconds', () => {
      expect(formatDuration(60000)).toBe('1m 0s') // 1 minute
      expect(formatDuration(90000)).toBe('1m 30s') // 1 min 30 sec
      expect(formatDuration(125000)).toBe('2m 5s') // 2 min 5 sec
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(3600000)).toBe('1h 0m') // 1 hour
      expect(formatDuration(5400000)).toBe('1h 30m') // 1.5 hours
      expect(formatDuration(7200000)).toBe('2h 0m') // 2 hours
    })

    it('should format days and hours', () => {
      expect(formatDuration(86400000)).toBe('1d 0h') // 1 day
      expect(formatDuration(90000000)).toBe('1d 1h') // 1 day 1 hour
      expect(formatDuration(172800000)).toBe('2d 0h') // 2 days
    })

    it('should handle milliseconds (< 1 second)', () => {
      expect(formatDuration(500)).toBe('0s')
      expect(formatDuration(999)).toBe('0s')
    })

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0s')
    })

    it('should show only the two largest units', () => {
      // 1 day, 2 hours, 30 minutes, 45 seconds
      const duration = 86400000 + 7200000 + 1800000 + 45000
      expect(formatDuration(duration)).toBe('1d 2h') // Days and hours only
    })

    it('should handle exact unit boundaries', () => {
      expect(formatDuration(1000)).toBe('1s')
      expect(formatDuration(60000)).toBe('1m 0s')
      expect(formatDuration(3600000)).toBe('1h 0m')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should format small numbers without separators', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(999)).toBe('999')
    })

    it('should format large numbers correctly', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1234567890)).toBe('1,234,567,890')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000')
      expect(formatNumber(-1234567)).toBe('-1,234,567')
    })

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
      expect(formatNumber(1000000.99)).toBe('1,000,000.99')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize(1, 'task')).toBe('task')
      expect(pluralize(1, 'item')).toBe('item')
    })

    it('should return plural for count of 0', () => {
      expect(pluralize(0, 'task')).toBe('tasks')
    })

    it('should return plural for count > 1', () => {
      expect(pluralize(2, 'task')).toBe('tasks')
      expect(pluralize(100, 'task')).toBe('tasks')
    })

    it('should use custom plural form when provided', () => {
      expect(pluralize(1, 'person', 'people')).toBe('person')
      expect(pluralize(5, 'person', 'people')).toBe('people')
    })

    it('should handle irregular plurals', () => {
      expect(pluralize(1, 'child', 'children')).toBe('child')
      expect(pluralize(3, 'child', 'children')).toBe('children')
      expect(pluralize(1, 'goose', 'geese')).toBe('goose')
      expect(pluralize(2, 'goose', 'geese')).toBe('geese')
    })

    it('should add "s" when no custom plural provided', () => {
      expect(pluralize(2, 'cat')).toBe('cats')
      expect(pluralize(5, 'dog')).toBe('dogs')
    })

    it('should handle negative counts as plural', () => {
      expect(pluralize(-1, 'item')).toBe('items')
      expect(pluralize(-5, 'item')).toBe('items')
    })
  })

  describe('Integration and Edge Cases', () => {
    it('should handle priority and status color consistency', () => {
      // Ensure priority colors map logically
      expect(getPriorityColor('none')).toBe('default')
      expect(getPriorityColor('low')).toBe('info')
      expect(getPriorityColor('medium')).toBe('warning')
      expect(getPriorityColor('high')).toBe('error')

      // Ensure status colors map logically
      expect(getStatusColor('pending')).toBe('default')
      expect(getStatusColor('in-progress')).toBe('primary')
      expect(getStatusColor('completed')).toBe('success')
    })

    it('should handle formatCount and pluralize consistency', () => {
      // Both should produce consistent plural forms
      expect(formatCount(1, 'task')).toContain(pluralize(1, 'task'))
      expect(formatCount(5, 'task')).toContain(pluralize(5, 'task'))
    })

    it('should handle unicode and special characters in text functions', () => {
      expect(capitalize('über')).toBe('Über')
      expect(truncate('Hello 👋 World', 8)).toBe('Hello...')
      expect(formatList(['café', 'naïve', 'résumé'])).toBe(
        'café, naïve, and résumé'
      )
    })

    it('should handle very long lists', () => {
      const longList = Array.from({ length: 100 }, (_, i) => `item${i + 1}`)
      const result = formatList(longList)
      expect(result).toContain('item1')
      expect(result).toContain('item100')
      expect(result).toContain(', and ')
    })

    it('should handle extremely large file sizes', () => {
      const petabyte = 1024 * 1024 * 1024 * 1024 * 1024
      const result = formatFileSize(petabyte)
      // Should still work even beyond TB (though not explicitly supported)
      expect(result).toBeTruthy()
    })

    it('should handle very long durations', () => {
      const longDuration = 365 * 24 * 60 * 60 * 1000 // 1 year in ms
      const result = formatDuration(longDuration)
      expect(result).toContain('d')
      expect(result).toBeTruthy()
    })
  })
})
