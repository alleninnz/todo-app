import { httpClient } from '@/shared/api/httpClient'
import type { Task, TaskDraft, TaskUpdate } from '@/shared/types/task.types'

const BASE_URL = 'tasks'

/**
 * Service for managing task-related API interactions.
 * Handles CRUD operations for tasks using the configured HTTP client.
 */
export const taskService = {
  /**
   * Fetches all tasks.
   * @returns Promise resolving to an array of Task objects.
   */
  getAll: async (): Promise<Task[]> => {
    return httpClient.get<Task[]>(BASE_URL)
  },

  /**
   * Fetches a single task by ID.
   * @param id - The unique identifier of the task.
   * @returns Promise resolving to a Task object.
   */
  getById: async (id: string): Promise<Task> => {
    return httpClient.get<Task>(`${BASE_URL}/${id}`)
  },

  /**
   * Creates a new task.
   * @param data - The task creation payload (TaskDraft).
   * @returns Promise resolving to the created Task object.
   */
  create: async (data: TaskDraft): Promise<Task> => {
    return httpClient.post<Task>(BASE_URL, { json: data })
  },

  /**
   * Updates an existing task.
   * @param id - The unique identifier of the task to update.
   * @param data - The task update payload (TaskUpdate).
   * @returns Promise resolving to the updated Task object.
   */
  update: async (id: string, data: TaskUpdate): Promise<Task> => {
    return httpClient.patch<Task>(`${BASE_URL}/${id}`, { json: data })
  },

  /**
   * Deletes a task.
   * @param id - The unique identifier of the task to delete.
   * @returns Promise resolving when the deletion is complete.
   */
  delete: async (id: string): Promise<void> => {
    return httpClient.delete<void>(`${BASE_URL}/${id}`)
  },
}
