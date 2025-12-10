import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import { taskService } from '../services'
import type { Task, TaskUpdate, TaskDraft } from '@/shared/types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

interface CreateMutationContext {
  previousTasks: Task[] | undefined
}

interface UpdateMutationContext {
  previousTasks: Task[] | undefined
  previousTask: Task | undefined
}

interface DeleteMutationContext {
  previousTasks: Task[] | undefined
}

export const useTaskActions = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  const invalidateTasks = useCallback(
    () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    [queryClient]
  )

  const createMutation = useMutation<Task, Error, TaskDraft, CreateMutationContext>({
    mutationFn: taskService.create,
    onMutate: async newTask => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      const optimisticTask = {
        ...newTask,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Task

      queryClient.setQueryData<Task[]>(taskKeys.all, old =>
        old ? [...old, optimisticTask] : [optimisticTask]
      )

      return { previousTasks }
    },
    onError: (_err, _var, context) => {
      if (context?.previousTasks === undefined) {
        queryClient.removeQueries({ queryKey: taskKeys.all })
      } else {
        queryClient.setQueryData(taskKeys.all, context.previousTasks)
      }
      showError('Failed to create task')
    },
    onSuccess: data => showSuccess(`Task "${data.title}" created`),
    onSettled: invalidateTasks,
  })

  const updateMutation = useMutation<Task, Error, { id: string; data: TaskUpdate }, UpdateMutationContext>({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id))

      queryClient.setQueryData<Task[]>(taskKeys.all, old =>
        old?.map(t => (t.id === id ? { ...t, ...data } : t))
      )
      queryClient.setQueryData<Task>(taskKeys.detail(id), old =>
        old ? { ...old, ...data } : old
      )

      return { previousTasks, previousTask }
    },
    onError: (_err, { id }, context) => {
      queryClient.setQueryData(taskKeys.all, context?.previousTasks)
      queryClient.setQueryData(taskKeys.detail(id), context?.previousTask)
      showError('Failed to update task')
    },
    onSuccess: data => showSuccess(`Task "${data.title}" updated`),
    onSettled: (_data, _err, { id }) => {
      invalidateTasks()
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })

  const deleteMutation = useMutation<void, Error, string, DeleteMutationContext>({
    mutationFn: taskService.delete,
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all })
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.all)

      queryClient.setQueryData<Task[]>(taskKeys.all, old =>
        old?.filter(t => t.id !== id)
      )

      return { previousTasks }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(taskKeys.all, context?.previousTasks)
      showError('Failed to delete task')
    },
    onSuccess: () => showSuccess('Task deleted'),
    onSettled: invalidateTasks,
  })

  // Stable callback wrappers
  const createTask = useCallback(
    (data: TaskDraft) => createMutation.mutate(data),
    [createMutation]
  )

  const updateTask = useCallback(
    (id: string, data: TaskUpdate) => updateMutation.mutate({ id, data }),
    [updateMutation]
  )

  const deleteTask = useCallback(
    (id: string) => deleteMutation.mutate(id),
    [deleteMutation]
  )

  const toggleComplete = useCallback(
    (id: string, completed: boolean) => updateMutation.mutate({ id, data: { completed } }),
    [updateMutation]
  )

  // Per-item loading state helpers
  const isTaskUpdating = useCallback(
    (id: string) => updateMutation.isPending && updateMutation.variables?.id === id,
    [updateMutation.isPending, updateMutation.variables]
  )

  const isTaskDeleting = useCallback(
    (id: string) => deleteMutation.isPending && deleteMutation.variables === id,
    [deleteMutation.isPending, deleteMutation.variables]
  )

  return {
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,

    // Async versions for promise-based workflows
    createTaskAsync: createMutation.mutateAsync,
    updateTaskAsync: updateMutation.mutateAsync,
    deleteTaskAsync: deleteMutation.mutateAsync,

    // Global loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Per-item loading states
    isTaskUpdating,
    isTaskDeleting,
  }
}
