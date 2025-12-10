import { useMemo } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { taskService } from '../services/task.service'
import {
  type Task,
  type TaskFilters,
  type TaskSortOption,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  PRIORITY_ORDER,
} from '@/shared/types'
import { parseDateString } from '@/shared/lib/date'

interface UseTasksOptions {
  filters?: TaskFilters
  sort?: TaskSortOption
  enabled?: boolean
  staleTime?: number
}

interface UseTasksResult extends Omit<UseQueryResult<Task[], Error>, 'data'> {
  tasks: Task[]
  allTasks: Task[] | undefined
  totalCount: number
  activeCount: number
  completedCount: number
  isEmpty: boolean
  hasTasks: boolean
}

/**
 * Hook for fetching and managing tasks.
 * Handles fetching, filtering, and sorting of tasks on the client side.
 *
 * @param options - Configuration options for filtering and sorting
 * @returns Query result with additional filtered/sorted tasks
 */
export const useTasks = ({
  filters = DEFAULT_FILTERS,
  sort = DEFAULT_SORT,
  enabled = true,
  staleTime = 30 * 1000, // 30 seconds
}: UseTasksOptions = {}): UseTasksResult => {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
    enabled,
    staleTime,
  })

  const tasks = useMemo(() => {
    if (!query.data) return []

    let result = [...query.data]

    // 1. Apply Filters
    if (filters.status !== 'all') {
      const isCompleted = filters.status === 'completed'
      result = result.filter(task => task.completed === isCompleted)
    }

    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority)
    }

    // 2. Apply Sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sort.field) {
        case 'priority': {
          const priorityA = PRIORITY_ORDER[a.priority]
          const priorityB = PRIORITY_ORDER[b.priority]
          comparison = priorityA - priorityB
          break
        }
        case 'dueDate': {
          // Tasks without due date usually go last in ascending, or depend on UX.
          // Here treating missing due date as "far future" for asc, "far past" for desc?
          // Let's stick to: simple timestamp comparison.
          const dateA = a.dueDate
            ? (parseDateString(a.dueDate)?.getTime() ?? 0)
            : 0
          const dateB = b.dueDate
            ? (parseDateString(b.dueDate)?.getTime() ?? 0)
            : 0
          // If both are 0 (no due date), they are equal.
          // If one has date and other doesn't:
          if (!a.dueDate && b.dueDate) return 1 // No due date -> Last
          if (a.dueDate && !b.dueDate) return -1 // No due date -> Last

          comparison = dateA - dateB
          break
        }
        case 'createdAt': {
          const dateA = parseDateString(a.createdAt)?.getTime() ?? 0
          const dateB = parseDateString(b.createdAt)?.getTime() ?? 0
          comparison = dateA - dateB
          break
        }
      }

      return sort.direction === 'asc' ? comparison : -comparison
    })

    return result
  }, [query.data, filters, sort])

  // Calculate counts from raw data
  const { totalCount, activeCount, completedCount } = useMemo(() => {
    if (!query.data) return { totalCount: 0, activeCount: 0, completedCount: 0 }

    let active = 0
    let completed = 0
    for (const task of query.data) {
      if (task.completed) completed++
      else active++
    }
    return { totalCount: query.data.length, activeCount: active, completedCount: completed }
  }, [query.data])

  return {
    ...query,
    tasks,
    allTasks: query.data,
    totalCount,
    activeCount,
    completedCount,
    isEmpty: query.isSuccess && tasks.length === 0,
    hasTasks: query.isSuccess && tasks.length > 0,
  }
}
