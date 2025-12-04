import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { taskService } from '../task.service'
import { server } from '@test/mocks/server'
import { env } from '@shared/config'
import type { Task, TaskDraft, TaskUpdate } from '@shared/types'

describe('features/tasks/services/taskService', () => {
  const baseUrl = env.VITE_API_BASE_URL
  const endpoint = `${baseUrl}/tasks`

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Description',
    priority: 'medium',
    completed: false,
    createdAt: '17-11-2025',
    dueDate: '20-11-2025',
  }

  beforeEach(() => {
    server.resetHandlers()
  })

  describe('getAll', () => {
    it('should fetch all tasks', async () => {
      const mockTasks = [mockTask]
      server.use(
        http.get(endpoint, () => {
          return HttpResponse.json(mockTasks)
        })
      )

      const result = await taskService.getAll()
      expect(result).toEqual(mockTasks)
    })
  })

  describe('getById', () => {
    it('should fetch a single task by id', async () => {
      server.use(
        http.get(`${endpoint}/1`, () => {
          return HttpResponse.json(mockTask)
        })
      )

      const result = await taskService.getById('1')
      expect(result).toEqual(mockTask)
    })
  })

  describe('create', () => {
    it('should create a new task', async () => {
      const draft: TaskDraft = {
        title: 'New Task',
        priority: 'low',
        completed: false,
        description: 'New Desc',
      }

      const createdTask = {
        ...draft,
        id: '2',
        createdAt: '18-11-2025',
      }

      server.use(
        http.post(endpoint, async () => {
          return HttpResponse.json(createdTask)
        })
      )

      const result = await taskService.create(draft)
      expect(result).toEqual(createdTask)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const update: TaskUpdate = { completed: true }
      const updatedTask = { ...mockTask, ...update }

      server.use(
        http.patch(`${endpoint}/1`, () => {
          return HttpResponse.json(updatedTask)
        })
      )

      const result = await taskService.update('1', update)
      expect(result).toEqual(updatedTask)
    })
  })

  describe('delete', () => {
    it('should delete a task', async () => {
      server.use(
        http.delete(`${endpoint}/1`, () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      await taskService.delete('1')
    })
  })
})
