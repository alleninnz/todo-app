# Todo App

一个基于 React + TypeScript 开发的现代化待办事项应用，采用 Feature-First 架构设计，注重类型安全、代码质量和可维护性。

## 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [文档](#-文档)
- [项目特点](#项目特点)
- [实现进度](#-实现进度)
- [核心工具](#-核心工具)
- [开发规范](#开发规范)

## 技术栈

- **框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite (Rolldown)
- **UI 框架**: Material-UI v7 + Tailwind CSS v4
- **状态管理**: Zustand
- **路由**: React Router v7
- **表单处理**: React Hook Form + Zod
- **HTTP 客户端**: Ky
- **日期处理**: Day.js
- **代码质量**: ESLint + Prettier

## ⚡ 核心特性

- ⚙️ **完整的基础设施** - HTTP 客户端、环境配置、主题系统已就绪
- ✅ **智能状态管理** - React Query 处理加载、缓存、同步与服务器状态
- ✅ **类型安全** - TypeScript + Zod 完整类型定义和运行时校验
- ✅ **自动数据转换** - HTTP 客户端自动处理 camelCase ↔ snake_case
- ✅ **开发体验** - ESLint + Prettier 自动化代码质量控制
- 🚧 **UI 实现进行中** - 任务管理界面开发中

### 核心依赖

#### UI 与样式

```bash
pnpm add @mui/material @emotion/react @emotion/styled
pnpm add @mui/icons-material @mui/x-date-pickers
pnpm add @fontsource-variable/roboto
pnpm add -D @tailwindcss/vite tailwindcss
```

#### 状态管理与路由

```bash
pnpm add zustand react-router react-router-dom
```

#### 表单与校验

```bash
pnpm add react-form-hook @hookform/resolvers zod
```

#### HTTP 客户端与工具

```bash
pnpm add ky dayjs
```

#### 开发工具

```bash
pnpm add -D eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh
pnpm add -D typescript-eslint globals
pnpm add -D prettier eslint-config-prettier
```

## 快速开始

### 环境配置

复制环境变量模板并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=TodoApp
VITE_TIMEOUT=10000
VITE_ENABLE_DEBUG=false
```

### 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码质量检查
pnpm lint

# 自动修复代码质量问题
pnpm lint:fix

# 代码格式化
pnpm format

# 检查代码格式（CI/CD 使用）
pnpm format:check

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 📚 文档

- [Custom Hooks 指南](docs/hooks.md) - React Query 集成指南和 useSnackbar 文档
- [项目概览](docs/overview.md) - 项目架构和设计理念
- [实现规范](docs/implementation-spec.md) - 开发规范和最佳实践

## 项目特点

### 架构设计

- **领域驱动**: 以 `features` 为单位组织业务逻辑（tasks、lists）
- **分层清晰**: UI 层、业务层、服务层、数据层职责分明
- **类型安全**: 全面的 TypeScript 类型定义和 Zod 运行时校验
- **可维护性**: 统一的命名约定和文件组织规则

### 目录结构

```text
src/
├── app/                    # 应用外壳
│   ├── App.tsx            # 应用根组件
│   ├── providers.tsx      # 全局 Provider 组合
│   ├── routes.tsx         # 路由配置
│   └── index.css          # 全局样式
├── features/              # 领域特性模块
│   ├── tasks/            # 任务管理
│   │   ├── components/   # TaskForm、TaskItem、TaskList 等
│   │   ├── hooks/        # useTaskActions、useTaskDetail
│   │   ├── services/     # task.service.ts
│   │   ├── store/        # tasks.store.ts
│   │   └── validation/   # task.schema.ts
│   └── lists/            # 列表筛选排序
│       ├── components/   # FilterBar、SortMenu、StatusTabs
│       └── hooks/        # useListFilters
├── pages/                 # 页面容器
│   └── TasksPage.tsx     # 任务页面
├── shared/               # 共享基础设施
│   ├── api/             # httpClient.ts - 自动转换 HTTP 客户端
│   ├── config/          # env.ts、theme.ts - 配置管理
│   ├── hooks/           # useSnackbar - 通用 Hooks
│   ├── lib/             # date.ts、format.ts - 工具函数
│   ├── types/           # task.types.ts、api.types.ts - 类型定义
│   └── ui/              # 通用 UI 组件
├── store/                # 全局状态管理入口
│   └── index.ts         # Store 导出桶
└── test/                 # 测试配置
    ├── setup.ts         # Vitest 配置
    └── mocks/           # MSW handlers
```

### 命名规范

| 文件后缀      | 用途                    | 说明                                    |
| ------------- | ----------------------- | --------------------------------------- |
| `.types.ts`   | 类型定义文件            | 纯类型声明，不包含实现                  |
| `.store.ts`   | Zustand 状态管理        | 同步状态 + actions，异步逻辑在 hooks 中 |
| `.service.ts` | 业务服务层（HTTP 调用） | 纯函数服务，不依赖 React                |
| `.schema.ts`  | 表单校验规则            | Zod schemas，用于表单验证               |
| `.test.ts(x)` | 测试文件                | 与被测试文件同目录或 `__tests__` 文件夹 |
| `.tsx`        | React 组件              | UI 组件，通过 hooks 连接业务层          |

## 📋 实现进度

### ✅ 已完成（Phase A - 基础设施层）

- ✅ **类型系统** - 完整的 Task 领域类型定义（`shared/types/task.types.ts`）
- ✅ **HTTP 客户端** - 自动 camelCase ↔ snake_case 转换（`shared/api/httpClient.ts`）
- ✅ **运行时校验** - Zod schemas 表单验证（`features/tasks/validation/task.schema.ts`）
- ✅ **自定义 Hooks** - useSnackbar（`shared/hooks/`）和 React Query 集成
- ✅ **工具函数** - 日期处理和格式化工具（`shared/lib/`）
- ✅ **测试基础设施** - Vitest + RTL + MSW 配置完成
- ✅ **主题配置** - Material-UI 主题系统（`shared/config/theme.ts`）
- ✅ **UI 组件** - ErrorBoundary、Layout、SnackbarProvider（`shared/ui/`）

### 🚧 进行中（Phase B - 任务功能）

- 🚧 **API 服务层** - task.service.ts 待实现
- 🚧 **状态管理** - tasks.store.ts 待实现
- 🚧 **业务 Hooks** - useTaskActions、useTaskDetail 待实现
- 🚧 **UI 组件** - TaskList、TaskItem、TaskForm 待实现

### 📅 待开发

- ⏳ **Phase C** - 列表筛选与排序（FilterBar、SortMenu、StatusTabs）
- ⏳ **Phase D** - 应用组装（TasksPage、路由集成）
- ⏳ **Phase E** - 质量保证与优化

## 开发规范

### 代码质量与格式化

本项目使用 **ESLint** 和 **Prettier** 进行代码质量控制和格式化：

- **ESLint**: 负责代码质量检查（逻辑错误、最佳实践、React Hooks 规则等）
- **Prettier**: 负责代码格式化（缩进、引号、换行等）
- 两者已配置为互不冲突，ESLint 专注质量，Prettier 专注格式

#### 配置文件

- `.prettierrc`: Prettier 配置（单引号、无分号、2 空格缩进等）
- `.prettierignore`: Prettier 忽略文件（node_modules、dist 等）
- `eslint.config.js`: ESLint 配置（包含 eslint-config-prettier 避免冲突）
- `.vscode/settings.json`: VS Code 编辑器配置（保存时自动格式化）

#### 使用建议

- 开发时推荐安装 VS Code 的 Prettier 扩展 (`esbenp.prettier-vscode`)
- 启用保存时自动格式化（已在 `.vscode/settings.json` 中配置）
- 提交代码前运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- CI/CD 中使用 `pnpm lint` 和 `pnpm format:check` 进行校验

### 环境变量

- 所有环境变量必须以 `VITE_` 开头
- 在 `vite-env.d.ts` 中定义类型
- 在 `env.ts` 中使用 Zod 校验和类型转换

### 状态管理

- Zustand store 只存储同步状态
- 异步操作封装在自定义 Hooks 中
- 通过 services 层调用 API

### 组件设计

- UI 组件职责单一，不包含业务逻辑
- 通过 Hooks 连接业务层
- 统一使用 Material-UI 组件库

### 路由与错误处理

- 使用 React Router v7 进行路由管理
- 全局错误边界 (`AppErrorBoundary`) 捕获运行时错误
- 路由错误使用 `ErrorPage` 组件展示友好错误信息

## 🔧 核心工具

### HTTP 客户端（自动数据转换）

项目使用 Ky 构建的 HTTP 客户端，**自动处理 camelCase ↔ snake_case 转换**：

```typescript
// 前端发送 camelCase
await httpClient.post('tasks', {
  json: { taskTitle: 'Buy groceries', dueDate: '2024-01-15' },
})
// 后端接收 snake_case: { task_title: ..., due_date: ... }

// 后端返回 snake_case: { task_id: '123', created_at: '...' }
const task = await httpClient.get<Task>('tasks/123')
// 前端收到 camelCase: { taskId: '123', createdAt: '...' }
```

**关键特性**：

- ✅ 请求/响应自动转换命名风格
- ✅ 错误标准化处理
- ✅ 自动重试机制
- ✅ Debug 日志（开发模式）

### 自定义 Hooks

项目提供了强大的自定义 Hooks，简化常见开发任务：

- **`React Query`** - 强大的异步状态管理库，替代手动管理 loading/error 状态
  - 自动缓存与去重
  - 窗口聚焦重新获取
  - 乐观更新 (Optimistic Updates)

```typescript
import { useQuery } from '@tanstack/react-query'

// 自动处理 loading, error, caching
const { data, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks
})
```

📖 **详细文档**: [Custom Hooks 指南](docs/hooks.md)
