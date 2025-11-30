# Custom Hooks 指南

本项目提供了一套强大的 React Hooks，用于简化异步状态管理和用户反馈通知。

## 目录

- [React Query Integration](#react-query-integration) - Data Fetching & Caching
- [useSnackbar](#usesnackbar) - Global Notification System

---

## React Query Integration

**Library**: `@tanstack/react-query`

We use React Query for all server state management (fetching, caching, synchronizing and updating server state). It replaces the legacy `useAsyncState` hook.

### Core Principles

- **Server State**: Data that persists remotely (API). managed by React Query.
- **Client State**: UI state (modals, form inputs), managed by Zustand or `useState`.
- **Stale-While-Revalidate**: Data is cached and background updated.

### Usage Patterns

#### 1. Fetching Data (useQuery)

Wrap API calls in custom hooks to ensure query keys are consistent.

```tsx
// features/tasks/hooks/useTasks.ts
import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/task.service'
import { taskKeys } from './task.keys' // centralized keys

export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

#### 2. Mutating Data (useMutation)

Use mutations for CUD operations (Create, Update, Delete).

```tsx
// features/tasks/hooks/useTaskMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'
import { taskService } from '../services/task.service'
import { taskKeys } from './task.keys'

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  return useMutation({
    mutationFn: taskService.create,
    onSuccess: newTask => {
      showSuccess(`Created "${newTask.title}"`)
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
    onError: error => {
      showError('Failed to create task')
    },
  })
}
```

#### 3. Query Key Management

Maintain query keys in a dedicated factory file to avoid invalidation bugs.

```typescript
// features/tasks/hooks/task.keys.ts
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}
```

### Best Practices

1. **Colocate Hooks**: Keep query hooks in `features/{feature}/hooks/`.
2. **Centralize Keys**: Always use a Query Key Factory.
3. **Optimistic Updates**: Use `onMutate` to update cache instantly for better UX.
4. **Error Handling**: Let global `onError` in `QueryClient` handle generic errors (like 500s), handle form errors locally.

---

## useSnackbar

**位置**: `src/shared/hooks/useSnackbar.ts`

基于 `notistack` 封装的类型安全通知 Hook，提供统一的用户反馈接口。

### useSnackbar 核心特性

- ✅ **类型安全** - TypeScript 完整类型定义
- ✅ **多种变体** - 支持 success、error、warning、info、default 五种通知类型
- ✅ **灵活配置** - 支持自定义时长、防重复、自定义操作等
- ✅ **全局控制** - 提供 close 和 closeAll 方法
- ✅ **简洁 API** - 语义化方法名，易于使用

### useSnackbar API 参考

#### 方法列表

| 方法                             | 用途         | 默认时长 | 颜色   |
| -------------------------------- | ------------ | -------- | ------ |
| `showSuccess(message, options?)` | 成功通知     | 4 秒     | 绿色   |
| `showError(message, options?)`   | 错误通知     | 6 秒     | 红色   |
| `showWarning(message, options?)` | 警告通知     | 4 秒     | 橙色   |
| `showInfo(message, options?)`    | 信息通知     | 4 秒     | 蓝色   |
| `show(message, options?)`        | 默认通知     | 4 秒     | 中性灰 |
| `close(key)`                     | 关闭指定通知 | -        | -      |
| `closeAll()`                     | 关闭所有通知 | -        | -      |

#### 配置选项

```typescript
interface SnackbarOptions {
  autoHideDuration?: number // 自动隐藏时长（毫秒）
  preventDuplicate?: boolean // 防止重复消息（默认 false）
  persist?: boolean // 是否持久显示（默认 false）
  action?: React.ReactNode // 自定义操作按钮
  anchorOrigin?: {
    // 显示位置
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}
```

### useSnackbar 使用示例

#### 基础用法

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar()

  const handleSave = async () => {
    // When using with React Query's onError/onSuccess callbacks,
    // this try/catch block is often unnecessary.
    // But for standalone async operations:
    try {
      await saveTask()
      showSuccess('任务保存成功')
    } catch (error) {
      showError('任务保存失败，请重试')
    }
  }

  return <button onClick={handleSave}>保存</button>
}
```

#### Combine with React Query

```tsx
import { useMutation } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskForm() {
  const { showSuccess, showError } = useSnackbar()

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: api.createTask,
    onSuccess: task => showSuccess(`Task "${task.title}" created`),
    onError: error => showError(error.message || 'Operation failed'),
  })

  const handleSubmit = (values: TaskInput) => {
    createTask(values)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

#### 自定义配置

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function AdvancedExample() {
  const { showWarning, close } = useSnackbar()

  const handleWarning = () => {
    const key = showWarning('此操作不可撤销', {
      autoHideDuration: 8000, // 显示 8 秒
      preventDuplicate: true, // 防止重复显示
      action: <Button onClick={() => close(key)}>知道了</Button>,
    })
  }

  return <button onClick={handleWarning}>显示警告</button>
}
```

#### 持久通知与手动关闭

```tsx
import { useState } from 'react'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function PersistentNotification() {
  const { show, close } = useSnackbar()
  const [notificationKey, setNotificationKey] = useState<string | null>(null)

  const showPersistent = () => {
    const key = show('正在处理，请稍候...', {
      persist: true, // 持久显示，不自动隐藏
    })
    setNotificationKey(key)
  }

  const hidePersistent = () => {
    if (notificationKey) {
      close(notificationKey)
      setNotificationKey(null)
    }
  }

  return (
    <div>
      <button onClick={showPersistent}>显示持久通知</button>
      <button onClick={hidePersistent}>关闭通知</button>
    </div>
  )
}
```

#### 批量操作反馈

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function BulkActions() {
  const { showSuccess, showError, showInfo } = useSnackbar()

  const handleBulkDelete = async (ids: string[]) => {
    showInfo(`正在删除 ${ids.length} 个任务...`)

    try {
      await api.bulkDelete(ids)
      showSuccess(`成功删除 ${ids.length} 个任务`)
    } catch (error) {
      showError('批量删除失败，请重试')
    }
  }

  return <button onClick={() => handleBulkDelete(selectedIds)}>批量删除</button>
}
```

### 全局配置

#### Provider 配置

在应用根组件中配置全局默认值：

```tsx
// src/shared/ui/SnackbarProvider.tsx
import { SnackbarProvider as NotistackProvider } from 'notistack'

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <NotistackProvider
      maxSnack={3} // 最多同时显示 3 个通知
      autoHideDuration={4000} // 默认 4 秒后隐藏
      anchorOrigin={{
        // 默认显示位置
        vertical: 'top',
        horizontal: 'right',
      }}
      preventDuplicate // 全局防止重复通知
    >
      {children}
    </NotistackProvider>
  )
}
```

#### 环境变量配置

在 `src/shared/config/env.ts` 中配置：

```typescript
export const env = {
  snackbar: {
    maxStack: 3,
    autoHideDuration: 4000,
  },
}
```

### useSnackbar 最佳实践

1. **为不同场景选择合适的通知类型**

   ```tsx
   showSuccess('保存成功') // 操作成功
   showError('网络连接失败') // 错误提示
   showWarning('即将过期') // 警告信息
   showInfo('正在同步数据...') // 一般信息
   ```

2. **错误通知显示时间可以更长**

   ```tsx
   showError('操作失败', { autoHideDuration: 6000 })
   ```

3. **防止重复通知**

   ```tsx
   showSuccess('已添加到收藏', { preventDuplicate: true })
   ```

4. **提供操作按钮增强交互**

   ```tsx
   showWarning('删除后无法恢复', {
     action: <Button onClick={handleUndo}>撤销</Button>,
   })
   ```

5. **Automate feedback with React Query**

   ```tsx
   useMutation({
     onSuccess: () => showSuccess('Operation success'),
     onError: err => showError(err.message),
   })
   ```

---

## Combined Usage Example

### Complete CRUD with React Query & Snackbar

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskManager() {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useSnackbar()

  // Fetch Tasks
  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: api.fetchTasks,
  })

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: task => {
      showSuccess(`Task "${task.title}" created`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => showError('Failed to create task'),
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => {
      showSuccess('Task deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => showError('Failed to delete task'),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorPage />

  return (
    <div>
      <TaskList tasks={tasks} onDelete={id => deleteMutation.mutate(id)} />
      <CreateTaskButton
        onCreate={values => createMutation.mutate(values)}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
```

---

## 相关资源

- [React Hooks 官方文档](https://react.dev/reference/react)
- [TypeScript 泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [notistack 文档](https://notistack.com/)
- [判别联合类型](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
