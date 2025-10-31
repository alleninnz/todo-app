# Todo App

一个基于 React + TypeScript 待办事项应用，采用Feature-First架构。

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

## 核心依赖（新增）

以下是在 Vite 基础脚手架之外额外安装的依赖：

### UI 与样式

```bash
pnpm add @mui/material @emotion/react @emotion/styled
pnpm add @mui/icons-material
pnpm add @mui/x-date-pickers
pnpm add @fontsource-variable/roboto
pnpm add -D @tailwindcss/vite tailwindcss
```

### 状态管理与路由

```bash
pnpm add zustand
pnpm add react-router react-router-dom
```

### 表单与校验

```bash
pnpm add react-form-hook
pnpm add @hookform/resolvers
pnpm add zod
```

### HTTP 客户端与工具

```bash
pnpm add ky
pnpm add dayjs
```

### 开发工具

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

## 项目特点

### 架构设计

- **领域驱动**: 以 `features` 为单位组织业务逻辑（tasks、lists）
- **分层清晰**: UI 层、业务层、服务层、数据层职责分明
- **类型安全**: 全面的 TypeScript 类型定义和 Zod 运行时校验
- **可维护性**: 统一的命名约定和文件组织规则

### 目录结构

```text
src/
├── app/              # 应用外壳（路由、Provider、全局样式）
├── features/         # 领域特性（按业务领域组织）
│   ├── tasks/       # 任务管理（CRUD、状态切换）
│   └── lists/       # 列表过滤与排序
├── pages/           # 页面容器
├── shared/          # 跨域共享（API、配置、工具、UI）
│   ├── api/        # HTTP 客户端
│   ├── config/     # 环境变量、主题配置
│   ├── hooks/      # 通用 Hooks
│   ├── lib/        # 工具函数
│   ├── types/      # 共享类型定义
│   └── ui/         # 通用 UI 组件
├── store/           # 全局状态管理
└── test/            # 测试配置
```

### 命名规范

| 文件后缀      | 用途                    |
| ------------- | ----------------------- |
| `.types.ts`   | 类型定义文件            |
| `.store.ts`   | Zustand 状态管理        |
| `.service.ts` | 业务服务层（HTTP 调用） |
| `.mapper.ts`  | DTO 与领域模型转换      |
| `.schema.ts`  | 表单校验规则            |
| `.paths.ts`   | API 路径定义            |

## MVP 功能

- ✅ 任务 CRUD（创建、编辑、删除）
- ✅ 状态切换（完成/未完成）
- ✅ 可选属性（截止日期、优先级、备注）
- ✅ 列表筛选（全部/进行中/已完成）
- ✅ 多维排序（创建时间/截止日期/优先级）
- ✅ 三态展示（加载中/空状态/错误状态）
- ✅ 数据持久化（后端 API 集成）

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
