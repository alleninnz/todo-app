# 项目阶段规划

## 阶段一：Core (MVP)

目标是交付最小可用版本，涵盖以下能力：

1. 任务 CRUD：创建 / 编辑 / 删除任务（标题必填）。
2. 状态切换：标记完成 / 未完成。
3. 可选截止日期与优先级（无 / 低 / 中 / 高）。
4. 备注描述字段。
5. 列表视图与筛选：全部 / 进行中 / 已完成。
6. 排序：按创建时间 / 截止日期 / 优先级。
7. 空状态、加载中状态、错误状态展示。
8. 与后端服务交互持久化数据（通过 Ky HTTP 客户端）。

### 第一阶段项目结构

```text
├─ .env
├─ .env.example
├─ .gitignore
├─ .prettierrc
├─ .prettierignore
├─ README.md
├─ eslint.config.js
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ index.html
├─ docs/
│  └─ overview.md
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ providers.tsx
│  │  └─ routes.tsx
│  │
│  ├─ features/
│  │  ├─ lists/
│  │  │  ├─ components/
│  │  │  │  ├─ FilterBar.tsx
│  │  │  │  ├─ SortMenu.tsx
│  │  │  │  └─ StatusTabs.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useListFilters.ts
│  │  │  └─ index.ts
│  │  │
│  │  └─ tasks/
│  │     ├─ components/
│  │     │  ├─ TaskEmptyState.tsx
│  │     │  ├─ TaskErrorState.tsx
│  │     │  ├─ TaskForm.tsx
│  │     │  ├─ TaskItem.tsx
│  │     │  └─ TaskList.tsx
│  │     ├─ hooks/
│  │     │  ├─ useTaskActions.ts
│  │     │  └─ useTaskDetail.ts
│  │     ├─ services/
│  │     │  ├─ task.mapper.ts
│  │     │  ├─ task.paths.ts
│  │     │  └─ task.service.ts
│  │     ├─ store/
│  │     │  └─ tasks.store.ts
│  │     ├─ types/
│  │     │  └─ task.types.ts
│  │     ├─ validation/
│  │     │  └─ task.schema.ts
│  │     └─ index.ts
│  │
│  ├─ pages/
│  │  └─ TasksPage.tsx
│  │
│  ├─ shared/
│  │  ├─ api/
│  │  │  └─ httpClient.ts
│  │  ├─ assets/
│  │  │  └─ .gitkeep
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  └─ theme.ts
│  │  ├─ hooks/
│  │  │  └─ useSnackbar.ts
│  │  ├─ lib/
│  │  │  ├─ date.ts
│  │  │  └─ format.ts
│  │  ├─ types/
│  │  │  └─ task.types.ts
│  │  └─ ui/
│  │     ├─ AppErrorBoundary.tsx
│  │     ├─ AppLayout.tsx
│  │     ├─ ErrorPage.tsx
│  │     ├─ LoadingSkeleton.tsx
│  │     └─ SnackbarProvider.tsx
│  │
│  ├─ store/
│  │  └─ index.ts
│  │
│  ├─ test/
│  │  └─ setup.ts
│  │
│  ├─ main.tsx
│  └─ vite-env.d.ts
│
└─ .vscode/
   └─ settings.json

```

### 目录与文件说明

#### 命名与分层约定

- .types.ts：仅类型声明（领域或共享）。不得包含实现或副作用。
- .store.ts：Zustand 切片。仅同步状态与 actions，不写异步。
- .service.ts：业务服务（HTTP 调用、领域转换的编排）。不依赖 React。
- .paths.ts：API 路径与路径生成器（紧邻领域）。
- .mapper.ts：DTO ↔ 领域模型转换的唯一来源。
- .schema.ts：输入/表单校验的结构定义（RHF 内置规则或第三方校验器的描述）。
- .tsx：纯 UI 组件与容器组件。组件内不直接触碰 HTTP，统一通过 hooks 调用服务。
- shared/\*：跨域基础设施（HTTP 客户端、主题、通用 hooks、工具函数、共享模型、通用 UI）。
- features/\*：以领域（tasks、lists）为单位的内聚实现，包含 components/hooks/services/store/types/validation。

#### 各目录与文件的用途

##### 根目录

- .env / .env.example：环境变量（Vite 只识别以 VITE\_ 开头的变量）；.env.example 指导团队如何配置。
- README.md：项目概述、开发/构建/部署命令、约定。
- docs/project-phases.md：阶段目标、验收清单、后续路线图。
- public/：静态资源（构建时原样拷贝）。

##### src/app（应用外壳层）

- App.tsx：应用根组件（薄），只负责把 Providers/路由装配起来。
- index.css：全局样式入口（Tailwind 层、Reset、变量）。
- providers.tsx：统一挂载全局 Provider（Theme、Snackbar、ErrorBoundary、Router 等），顺序至关重要：ErrorBoundary → Theme → Snackbar → Router。
- routes.tsx：路由表（懒加载），业务数据不要写在这里。

##### src/features/lists（列表过滤与排序）

- components/：FilterBar.tsx、SortMenu.tsx、StatusTabs.tsx 只做 UI 与回调。
- hooks/useListFilters.ts：集中管理过滤/排序状态（MVP 可用内部 state；后续可绑定 URL）。
- index.ts：对外导出公共 API，形成防腐层。

##### src/features/tasks（任务领域）

- components/：
  - TaskForm.tsx：使用 react-hook-form 的创建/编辑表单（标题必填；截止日期/优先级/备注可选）。
  - TaskItem.tsx：单条任务 UI（完成切换、编辑、删除）。
  - TaskList.tsx：任务列表容器（纯渲染 + 回调）。
  - TaskEmptyState.tsx / TaskErrorState.tsx：三态组件。
- hooks/：
  - useTaskActions.ts：封装加载/创建/更新/删除/切换完成的异步业务，调用 task.service.ts 并写入 tasks.store.ts。
  - useTaskDetail.ts：读取单条任务（可先从 store 读，缺失时请求）。
- services/：
  - task.paths.ts：任务 API 路径与构造函数（领域内聚）。
  - task.mapper.ts：DTO ↔ 领域模型转换的唯一来源。
  - task.service.ts：调用 httpClient 的纯函数服务（不依赖 React），对外返回统一领域模型。
- store/：
  - tasks.store.ts：Zustand 切片，存储 items/order/loading/error 等客户端状态（不写异步）。
- types/：
  - task.types.ts：任务域专有类型（如 TaskInput、TaskDTO 等）。注意：跨域公共的 Task 放在 shared/types/task.types.ts。
- validation/：
  - task.schema.ts：表单校验结构（即使先用 RHF 内置规则，也定义 schema 作为接口契约，后续可换 zod）。
- index.ts：对外导出任务域允许访问的实体（组件、hooks、服务类型），屏蔽内部深路径。

##### src/pages（页面容器层）

- TasksPage.tsx：页面拼装（Filter/Sort/Tabs + List + Form），控制三态，通过 useTaskActions() 触发加载/变更。

##### src/shared（跨域共享层）

- api/httpClient.ts：Ky 客户端（统一超时、重试、认证、错误转换）。唯一 HTTP 实例。
- config/env.ts：读取并校验 import.meta.env（比如 VITE_API_BASE_URL），对外导出 env.API_BASE_URL。
- config/theme.ts：MUI 主题。
- hooks/：useSnackbar.ts（全局消息）。
- lib/：date.ts（日期比较/排序 key/逾期判断）、format.ts（文本/优先级/日期格式化）。
- types/task.types.ts：跨域共享领域模型 Task & Priority（UI/服务/页面统一认这个）。
- ui/：
  - AppErrorBoundary.tsx：全局兜底错误边界
  - AppLayout.tsx：通用布局容器
  - ErrorPage.tsx：通用错误页面组件（用于路由错误处理）
  - LoadingSkeleton.tsx：统一骨架屏
  - SnackbarProvider.tsx：全局消息 Provider

##### src/store/index.ts

- 应用级 store 出口：聚合/转发各领域的 store hook（或直接 re-export useTasksStore）。

##### 其他

- test/setup.ts：测试全局初始化（jest-dom、mocks、MSW 等）。
- main.tsx：Vite 入口，挂载 `<App />`。
- vite-env.d.ts：Vite 环境变量类型提示。
