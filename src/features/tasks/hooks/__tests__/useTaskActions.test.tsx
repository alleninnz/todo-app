/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTaskActions } from '../useTaskActions'
import { server } from '@/test/mocks/server'
import type { Task, TaskDraft } from '@/shared/types'

// Mock useSnackbar
const showSuccessMock = vi.fn()
const showErrorMock = vi.fn()
vi.mock('@/shared/hooks/useSnackbar', () => ({
  useSnackbar: () => ({
    showSuccess: showSuccessMock,
    showError: showErrorMock,
  }),
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

describe('useTaskActions', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('createTask', () => {
    it('should optimistically create task and invalidate cache', async () => {
      const newTask: TaskDraft = {
        title: 'New Task',
        completed: false,
        priority: 'low',
      }
      const createdTask = { ...newTask, id: '1', createdAt: '2023-01-01' }

      server.use(
        http.post('*/tasks', () =>
          HttpResponse.json(createdTask, { status: 201 })
        )
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.createTask(newTask)

      // Optimistic update
      await waitFor(() => {
        const tasks = queryClient.getQueryData<Task[]>(['tasks'])
        expect(tasks).toHaveLength(1)
        expect(tasks?.[0].id).toContain('temp-')
      })

      // Success
      await waitFor(() => {
        expect(showSuccessMock).toHaveBeenCalledWith(
          `Task "${createdTask.title}" created`
        )
      })
    })

    it('should rollback on error', async () => {
      server.use(
        http.post('*/tasks', () => new HttpResponse(null, { status: 400 }))
      )
      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.createTask({
        title: 'Fail',
        completed: false,
        priority: 'low',
      })

      await waitFor(() => expect(showErrorMock).toHaveBeenCalled())
      expect(queryClient.getQueryData(['tasks'])).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('should optimistically update task', async () => {
      const task: Task = {
        id: '1',
        title: 'Old',
        completed: false,
        priority: 'low',
        createdAt: '2023',
      }
      queryClient.setQueryData(['tasks'], [task])

      server.use(
        http.patch('*/tasks/1', () =>
          HttpResponse.json({ ...task, title: 'New' })
        )
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.updateTask('1', { title: 'New' })

      await waitFor(() => {
        const tasks = queryClient.getQueryData<Task[]>(['tasks'])
        expect(tasks?.[0].title).toBe('New')
      })

      await waitFor(() => expect(showSuccessMock).toHaveBeenCalled())
    })
  })

  describe('deleteTask', () => {
    it('should optimistically delete task', async () => {
      const task: Task = {
        id: '1',
        title: 'Delete Me',
        completed: false,
        priority: 'low',
        createdAt: '2023',
      }
      queryClient.setQueryData(['tasks'], [task])

      server.use(
        http.delete('*/tasks/1', () => new HttpResponse(null, { status: 200 }))
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.deleteTask('1')

      await waitFor(() => {
        expect(queryClient.getQueryData(['tasks'])).toHaveLength(0)
      })

      await waitFor(() => expect(showSuccessMock).toHaveBeenCalled())
    })

    it('should rollback on error', async () => {
      const task: Task = {
        id: '1',
        title: 'Keep Me',
        completed: false,
        priority: 'low',
        createdAt: '2023',
      }
      queryClient.setQueryData(['tasks'], [task])

      server.use(
        http.delete('*/tasks/1', () => new HttpResponse(null, { status: 400 }))
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.deleteTask('1')

      await waitFor(() => {
        const tasks = queryClient.getQueryData<Task[]>(['tasks'])
        expect(tasks).toHaveLength(1)
        expect(tasks?.[0].id).toBe('1')
        expect(showErrorMock).toHaveBeenCalled()
      })
    })
  })

  describe('toggleComplete', () => {
    it('should toggle task completion', async () => {
      const task: Task = {
        id: '1',
        title: 'Toggle Me',
        completed: false,
        priority: 'low',
        createdAt: '2023',
      }
      queryClient.setQueryData(['tasks'], [task])

      server.use(
        http.patch('*/tasks/1', () =>
          HttpResponse.json({ ...task, completed: true })
        )
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      result.current.toggleComplete('1', true)

      await waitFor(() => {
        const tasks = queryClient.getQueryData<Task[]>(['tasks'])
        expect(tasks?.[0].completed).toBe(true)
      })

      await waitFor(() => expect(showSuccessMock).toHaveBeenCalled())
    })
  })

  describe('loading states', () => {
    it('should track isCreating state', async () => {
      const newTask: TaskDraft = {
        title: 'New Task',
        completed: false,
        priority: 'low',
      }

      server.use(
        http.post('*/tasks', async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json(
            { ...newTask, id: '1', createdAt: '2023' },
            { status: 201 }
          )
        })
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      expect(result.current.isCreating).toBe(false)

      result.current.createTask(newTask)

      await waitFor(() => expect(result.current.isCreating).toBe(true))
      await waitFor(() => expect(result.current.isCreating).toBe(false))
    })

    it('should track per-item updating state', async () => {
      const task: Task = {
        id: '1',
        title: 'Test',
        completed: false,
        priority: 'low',
        createdAt: '2023',
      }
      queryClient.setQueryData(['tasks'], [task])

      server.use(
        http.patch('*/tasks/1', async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json({ ...task, title: 'Updated' })
        })
      )

      const { result } = renderHook(() => useTaskActions(), { wrapper })

      expect(result.current.isTaskUpdating('1')).toBe(false)

      result.current.updateTask('1', { title: 'Updated' })

      await waitFor(() => expect(result.current.isTaskUpdating('1')).toBe(true))
      await waitFor(() =>
        expect(result.current.isTaskUpdating('1')).toBe(false)
      )
    })
  })
})
