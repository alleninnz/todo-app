# Custom Hooks 指南

本项目提供了一套强大的自定义 React Hooks，用于简化异步状态管理和用户反馈通知。

## 目录

- [useAsyncState](#useasyncstate) - 异步状态管理
- [useSnackbar](#usesnackbar) - 全局通知系统

---

## useAsyncState

**位置**: `src/shared/hooks/useAsyncState.ts`

用于管理异步操作状态的通用 Hook，提供类型安全的状态管理和竞态条件保护。

### 核心特性

- ✅ **判别联合类型** - 使用 TypeScript 判别联合确保状态一致性
- ✅ **竞态保护** - 自动处理多次异步调用的竞态问题
- ✅ **生命周期回调** - 支持 `onStart`、`onSuccess`、`onError`、`onFinally`
- ✅ **便捷派生状态** - 提供 `isLoading`、`isSuccess`、`isError`、`isIdle` 布尔值
- ✅ **手动状态控制** - 支持 `setData`、`setError` 用于乐观更新
- ✅ **类型安全** - 完整的 TypeScript 泛型支持

### 类型定义

```typescript
type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

type AsyncState<T, E = Error> =
  | { status: 'idle'; data: T | null; error: null }
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | null; error: E }

interface UseAsyncStateOptions<T, E = Error> {
  initialData?: T | null // 初始数据
  onStart?: () => void // 开始加载时触发
  onSuccess?: (data: T) => void // 加载成功时触发
  onError?: (error: E) => void // 加载失败时触发
  onFinally?: () => void // 加载完成时触发（无论成功或失败）
  resetOnUnmount?: boolean // 卸载时是否重置计数器（默认 true）
}
```

### API 参考

#### 返回值

| 属性         | 类型                                                | 说明                                                          |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------- |
| `status`     | `AsyncStatus`                                       | 当前状态：`'idle'` \| `'loading'` \| `'success'` \| `'error'` |
| `data`       | `T \| null`                                         | 成功时的数据（仅 `status === 'success'` 时保证非 null）       |
| `error`      | `E \| null`                                         | 失败时的错误（仅 `status === 'error'` 时保证非 null）         |
| `execute()`  | `(asyncFn: () => Promise<T>) => Promise<T \| null>` | 执行异步函数并管理状态                                        |
| `reset()`    | `() => void`                                        | 重置到初始状态                                                |
| `setData()`  | `(data: T \| null) => void`                         | 手动设置数据（用于乐观更新）                                  |
| `setError()` | `(error: E \| null) => void`                        | 手动设置错误                                                  |
| `isIdle`     | `boolean`                                           | 是否为初始状态                                                |
| `isLoading`  | `boolean`                                           | 是否正在加载                                                  |
| `isSuccess`  | `boolean`                                           | 是否加载成功                                                  |
| `isError`    | `boolean`                                           | 是否加载失败                                                  |

### 使用示例

#### 基础用法

```tsx
import { useEffect } from 'react'
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { fetchTasks } from '@shared/api'

function TaskList() {
  const { data, isLoading, isError, error, execute } = useAsyncState<Task[]>()

  useEffect(() => {
    execute(() => fetchTasks())
  }, [execute])

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />

  return <TaskListView items={data} />
}
```

#### 带生命周期回调

```tsx
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { useSnackbar } from '@shared/hooks/useSnackbar'
import { useNavigate } from 'react-router-dom'

function CreateTaskForm() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useSnackbar()

  const { execute, isLoading } = useAsyncState<Task>({
    onSuccess: task => {
      showSuccess(`任务 "${task.title}" 创建成功`)
      navigate('/tasks')
    },
    onError: error => {
      showError(error.message || '创建任务失败')
    },
  })

  const handleSubmit = async (values: TaskInput) => {
    await execute(() => api.createTask(values))
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '创建中...' : '创建任务'}
      </button>
    </form>
  )
}
```

#### 乐观更新

```tsx
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskList() {
  const { showError } = useSnackbar()
  const { data, setData, execute } = useAsyncState<Task[]>()

  const toggleComplete = async (id: string) => {
    if (!data) return

    const oldData = data

    // 立即更新 UI（乐观更新）
    const optimisticData = data.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setData(optimisticData)

    try {
      await execute(() => api.toggleTask(id))
    } catch (error) {
      // 失败时回滚到原状态
      setData(oldData)
      showError('操作失败，已恢复原状态')
    }
  }

  return <TaskListView items={data} onToggle={toggleComplete} />
}
```

#### 手动状态控制

```tsx
import { useAsyncState } from '@shared/hooks/useAsyncState'

function TaskManager() {
  const { data, setData, setError, reset, execute } = useAsyncState<Task[]>({
    initialData: [],
  })

  const loadTasks = () => {
    execute(() => api.fetchTasks())
  }

  const handleClearCache = () => {
    reset() // 重置到初始状态
  }

  const handleManualUpdate = (newTasks: Task[]) => {
    setData(newTasks) // 手动设置数据（会将状态设为 'success'）
  }

  const handleSimulateError = () => {
    setError(new Error('模拟错误')) // 手动设置错误（会将状态设为 'error'）
  }

  return (
    <div>
      <button onClick={loadTasks}>加载任务</button>
      <button onClick={handleClearCache}>清除缓存</button>
    </div>
  )
}
```

### 高级特性

#### 竞态保护机制

当用户快速触发多次异步操作时，Hook 会自动忽略过期的请求结果，确保只有最新的请求结果会更新状态：

```tsx
// 用户快速连续执行两次搜索
execute(() => searchTasks('React')) // 执行 #1
execute(() => searchTasks('TypeScript')) // 执行 #2

// 即使 #1 比 #2 后完成，状态也不会被 #1 的结果覆盖
// 最终显示的一定是最新搜索（#2）的结果
```

**实现原理**: 每次调用 `execute()` 都会递增内部的执行计数器，只有当请求完成时的计数器与当前计数器匹配时，才会更新状态。

#### 自定义错误类型

```tsx
interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

const { error, execute } = useAsyncState<Task, ApiError>({
  onError: err => {
    console.log('错误代码:', err.code)
    console.log('错误消息:', err.message)
  },
})
```

#### 组合使用多个异步状态

```tsx
function Dashboard() {
  const tasks = useAsyncState<Task[]>()
  const projects = useAsyncState<Project[]>()
  const stats = useAsyncState<Statistics>()

  useEffect(() => {
    Promise.all([
      tasks.execute(() => api.fetchTasks()),
      projects.execute(() => api.fetchProjects()),
      stats.execute(() => api.fetchStats()),
    ])
  }, [])

  const isLoading = tasks.isLoading || projects.isLoading || stats.isLoading
  const hasError = tasks.isError || projects.isError || stats.isError

  if (isLoading) return <FullPageSpinner />
  if (hasError) return <ErrorPage />

  return (
    <div>
      <TaskSection data={tasks.data} />
      <ProjectSection data={projects.data} />
      <StatsSection data={stats.data} />
    </div>
  )
}
```

### 最佳实践

1. **总是在 useEffect 中调用 execute**

   ```tsx
   // ✅ 推荐
   useEffect(() => {
     execute(() => fetchData())
   }, [execute])

   // ❌ 避免在渲染期间调用
   execute(() => fetchData())
   ```

2. **使用派生布尔值而非直接比较 status**

   ```tsx
   // ✅ 推荐
   if (isLoading) return <Spinner />

   // ❌ 避免
   if (status === 'loading') return <Spinner />
   ```

3. **乐观更新时记得处理失败回滚**

   ```tsx
   // ✅ 推荐
   const oldData = data
   setData(optimisticData)
   try {
     await execute(...)
   } catch {
     setData(oldData) // 回滚
   }
   ```

4. **善用生命周期回调分离关注点**
   ```tsx
   // ✅ 推荐：在配置中处理副作用
   useAsyncState({
     onSuccess: data => navigate('/success'),
     onError: err => showError(err.message),
   })
   ```

---

## useSnackbar

**位置**: `src/shared/hooks/useSnackbar.ts`

基于 `notistack` 封装的类型安全通知 Hook，提供统一的用户反馈接口。

### 核心特性

- ✅ **类型安全** - TypeScript 完整类型定义
- ✅ **多种变体** - 支持 success、error、warning、info、default 五种通知类型
- ✅ **灵活配置** - 支持自定义时长、防重复、自定义操作等
- ✅ **全局控制** - 提供 close 和 closeAll 方法
- ✅ **简洁 API** - 语义化方法名，易于使用

### API 参考

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

### 使用示例

#### 基础用法

```tsx
import { useSnackbar } from '@shared/hooks/useSnackbar'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar()

  const handleSave = async () => {
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

#### 结合 useAsyncState

```tsx
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { useSnackbar } from '@shared/hooks/useSnackbar'

function TaskForm() {
  const { showSuccess, showError } = useSnackbar()

  const { execute, isLoading } = useAsyncState<Task>({
    onSuccess: task => showSuccess(`任务 "${task.title}" 已创建`),
    onError: error => showError(error.message || '操作失败'),
  })

  const handleSubmit = (values: TaskInput) => {
    execute(() => api.createTask(values))
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

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
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

### 最佳实践

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

5. **结合异步状态管理自动化反馈**
   ```tsx
   useAsyncState({
     onSuccess: () => showSuccess('操作成功'),
     onError: err => showError(err.message),
   })
   ```

---

## 组合使用示例

### 完整的 CRUD 操作流程

```tsx
import { useAsyncState } from '@shared/hooks/useAsyncState'
import { useSnackbar } from '@shared/hooks/useSnackbar'
import { useNavigate } from 'react-router-dom'

function TaskManager() {
  const navigate = useNavigate()
  const { showSuccess, showError, showWarning } = useSnackbar()

  // 获取任务列表
  const {
    data: tasks,
    isLoading,
    isError,
    execute: fetchTasks,
  } = useAsyncState<Task[]>({
    initialData: [],
    onError: () => showError('加载任务失败'),
  })

  // 创建任务
  const { execute: createTask } = useAsyncState<Task>({
    onSuccess: task => {
      showSuccess(`任务 "${task.title}" 已创建`)
      fetchTasks(() => api.fetchTasks()) // 刷新列表
    },
    onError: () => showError('创建任务失败'),
  })

  // 删除任务
  const { execute: deleteTask } = useAsyncState<void>({
    onSuccess: () => {
      showSuccess('任务已删除')
      fetchTasks(() => api.fetchTasks()) // 刷新列表
    },
    onError: () => showError('删除任务失败'),
  })

  // 初始加载
  useEffect(() => {
    fetchTasks(() => api.fetchTasks())
  }, [fetchTasks])

  const handleCreate = (values: TaskInput) => {
    createTask(() => api.createTask(values))
  }

  const handleDelete = (id: string) => {
    showWarning('确定要删除这个任务吗？', {
      action: (
        <Button onClick={() => deleteTask(() => api.deleteTask(id))}>
          确认删除
        </Button>
      ),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorPage />

  return (
    <div>
      <TaskList tasks={tasks} onDelete={handleDelete} />
      <CreateTaskButton onCreate={handleCreate} />
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

## 常见问题

### Q: execute 返回的 Promise 什么时候返回 null？

A: 当请求因竞态保护被忽略时返回 null。例如快速连续执行两次 execute，第一次的结果会被忽略并返回 null。

### Q: 如何在组件卸载时取消正在进行的请求？

A: useAsyncState 默认会在组件卸载时重置执行计数器（`resetOnUnmount: true`），这会导致正在进行的请求结果被忽略。如果需要真正取消 HTTP 请求，应该使用 AbortController。

### Q: 为什么 TypeScript 知道 status === 'success' 时 data 不为 null？

A: 因为 AsyncState 使用了判别联合类型（Discriminated Union），`status` 字段作为判别符，TypeScript 能够根据 status 的值自动收窄类型。

### Q: 如何显示全局加载状态？

A: 可以在 Provider 层监听多个 useAsyncState 的 isLoading 状态，或使用全局状态管理（如 Zustand）来跟踪所有异步操作的加载状态。
