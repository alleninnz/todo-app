/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTasks } from '../useTasks'
import { server } from '@/test/mocks/server'
import type { Task } from '@/shared/types'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    priority: 'high',
    completed: false,
    createdAt: '10-11-2025', // Oldest
    dueDate: '20-11-2025',
  },
  {
    id: '2',
    title: 'Task 2',
    priority: 'medium',
    completed: true,
    createdAt: '11-11-2025',
    dueDate: '19-11-2025',
  },
  {
    id: '3',
    title: 'Task 3',
    priority: 'low',
    completed: false,
    createdAt: '12-11-2025', // Newest
    dueDate: undefined, // No due date
  },
]

describe('useTasks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()

    // Default handler
    server.use(
      http.get('*/tasks', () => {
        return HttpResponse.json(mockTasks)
      })
    )
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should fetch and return tasks', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.tasks).toHaveLength(3)
    expect(result.current.allTasks).toHaveLength(3)
    expect(result.current.hasTasks).toBe(true)
    expect(result.current.isEmpty).toBe(false)
  })

  it('should handle loading state', () => {
    const { result } = renderHook(() => useTasks(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('should handle error state', async () => {
    server.use(
      http.get('*/tasks', () => {
        return new HttpResponse(null, { status: 400 })
      })
    )

    const { result } = renderHook(() => useTasks(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.tasks).toEqual([])
  })

  describe('Filtering', () => {
    it('should filter by status: active', async () => {
      const { result } = renderHook(
        () => useTasks({ filters: { status: 'active' } }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.tasks).toHaveLength(2)
      expect(result.current.tasks.every(t => !t.completed)).toBe(true)
    })

    it('should filter by status: completed', async () => {
      const { result } = renderHook(
        () => useTasks({ filters: { status: 'completed' } }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].id).toBe('2')
    })

    it('should filter by priority', async () => {
      const { result } = renderHook(
        () => useTasks({ filters: { status: 'all', priority: 'high' } }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].priority).toBe('high')
    })
  })

  describe('Count Statistics', () => {
    it('should return correct task counts', async () => {
      const { result } = renderHook(() => useTasks(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.totalCount).toBe(3)
      expect(result.current.activeCount).toBe(2) // Task 1 and 3
      expect(result.current.completedCount).toBe(1) // Task 2
    })
  })

  describe('Enabled Option', () => {
    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(() => useTasks({ enabled: false }), {
        wrapper,
      })

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isFetching).toBe(false)
      expect(result.current.tasks).toEqual([])
    })
  })

  describe('Sorting', () => {
    it('should sort by priority desc (High -> Low)', async () => {
      const { result } = renderHook(
        () =>
          useTasks({
            sort: { field: 'priority', direction: 'desc' },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const priorities = result.current.tasks.map(t => t.priority)
      expect(priorities).toEqual(['high', 'medium', 'low'])
    })

    it('should sort by priority asc (Low -> High)', async () => {
      const { result } = renderHook(
        () =>
          useTasks({
            sort: { field: 'priority', direction: 'asc' },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const priorities = result.current.tasks.map(t => t.priority)
      expect(priorities).toEqual(['low', 'medium', 'high'])
    })

    it('should sort by createdAt desc (Newest -> Oldest)', async () => {
      const { result } = renderHook(
        () =>
          useTasks({
            sort: { field: 'createdAt', direction: 'desc' },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const ids = result.current.tasks.map(t => t.id)
      // 3 (12-11), 2 (11-11), 1 (10-11)
      expect(ids).toEqual(['3', '2', '1'])
    })

    it('should sort by createdAt asc (Oldest -> Newest)', async () => {
      const { result } = renderHook(
        () =>
          useTasks({
            sort: { field: 'createdAt', direction: 'asc' },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const ids = result.current.tasks.map(t => t.id)
      // 1 (10-11), 2 (11-11), 3 (12-11)
      expect(ids).toEqual(['1', '2', '3'])
    })

    it('should sort by dueDate asc (Soonest -> Latest)', async () => {
      const { result } = renderHook(
        () =>
          useTasks({
            sort: { field: 'dueDate', direction: 'asc' },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // 2 (19-11), 1 (20-11), 3 (undefined - last)
      const ids = result.current.tasks.map(t => t.id)
      expect(ids).toEqual(['2', '1', '3'])
    })
  })
})
