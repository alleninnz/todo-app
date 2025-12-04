import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@/shared/hooks/useSnackbar'
import { taskService } from '../services/task.service'
import type { Task, TaskUpdate } from '@/shared/types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

export const useTaskActions = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  const invalidateTasks = () =>
    queryClient.invalidateQueries({ queryKey: taskKeys.all })

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
      taskService.update(id, data),
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

  const deleteMutation = useMutation({
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

  return {
    createTask: createMutation.mutate,
    updateTask: (id: string, data: TaskUpdate) =>
      updateMutation.mutate({ id, data }),
    deleteTask: deleteMutation.mutate,
    toggleComplete: (id: string, completed: boolean) =>
      updateMutation.mutate({ id, data: { completed } }),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
