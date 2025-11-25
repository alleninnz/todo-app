# LoadingSkeleton Usage Examples

## Overview

The `LoadingSkeleton` component provides a configuration-driven skeleton loading system with multiple variants optimized for the Todo App UI.

## Basic Usage

### Task Card Skeleton

```tsx
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton'

function TasksPage() {
  const { isLoading } = useTaskActions()

  if (isLoading) {
    return <LoadingSkeleton variant="taskCard" />
  }

  return <TaskList tasks={tasks} />
}
```

### Task List Skeleton

```tsx
function TasksPage() {
  const { isLoading } = useTaskActions()

  if (isLoading) {
    return <LoadingSkeleton variant="taskList" count={5} />
  }

  return <TaskList tasks={tasks} />
}
```

### Text Skeleton

```tsx
function TaskDescription() {
  const { isLoading, description } = useTaskDetail(taskId)

  if (isLoading) {
    return <LoadingSkeleton variant="text" lines={3} width="90%" />
  }

  return <Typography>{description}</Typography>
}
```

### Circular Skeleton

```tsx
function UserAvatar() {
  const { isLoading, avatar } = useUser()

  if (isLoading) {
    return <LoadingSkeleton variant="circular" width={48} />
  }

  return <Avatar src={avatar} />
}
```

## Advanced Usage

### Disable Animation

```tsx
// Useful for reducing motion (accessibility)
<LoadingSkeleton variant="taskCard" animated={false} />
```

### Custom Dimensions

```tsx
// Text with custom width
<LoadingSkeleton variant="text" width="75%" />

// Circular with custom size
<LoadingSkeleton variant="circular" width={64} height={64} />
```

### Loading States Pattern

```tsx
function TaskList() {
  const { tasks, isLoading, error } = useTaskActions()

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton variant="taskList" count={3} />
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />
  }

  // Empty state
  if (!tasks.length) {
    return <EmptyState />
  }

  // Success state
  return (
    <Stack spacing={2}>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </Stack>
  )
}
```

## Variants Reference

| Variant    | Description                           | Props                                          |
| ---------- | ------------------------------------- | ---------------------------------------------- |
| `taskCard` | Mimics task item structure            | `animated?`                                    |
| `taskList` | Multiple task card skeletons          | `count?` (default: 3), `animated?`             |
| `text`     | Single or multi-line text placeholder | `width?`, `lines?` (default: 1), `animated?`   |
| `circular` | Round skeleton for avatars/icons      | `width?` (default: 40), `height?`, `animated?` |

## Architecture Benefits

### Configuration-Driven

- No if-else chains in component logic
- Easy to extend with new variants
- Type-safe with TypeScript

### Component Composition

- Each variant is a standalone sub-component
- Promotes code reusability
- Better testability

### Theme Integration

- Fully integrated with MUI theme
- Consistent spacing and colors
- Dark mode ready

## Styling Strategy

### MUI Components (Visual Styling)

```tsx
// ✅ CORRECT - Use MUI for visual styling
<Box
  sx={{
    p: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 2,
    bgcolor: 'background.paper',
  }}
>
  <Skeleton variant="text" />
</Box>
```

### Tailwind Utilities (Layout Only)

```tsx
// ✅ CORRECT - Use Tailwind for layout
<div className="flex items-center gap-3">
  <Skeleton variant="circular" />
  <div className="flex-1">
    <Skeleton variant="text" />
  </div>
</div>
```

## Performance Considerations

- Wave animation can be disabled for performance
- Use appropriate `count` values to avoid over-rendering
- Skeleton components are lightweight and performant

## Accessibility

- Provides visual feedback during loading states
- Animation can be disabled for users with motion sensitivity
- Semantic structure matches actual content
