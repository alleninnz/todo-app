import { memo } from 'react'
import { Box, Skeleton, Stack } from '@mui/material'

/**
 * Skeleton dimension constants for consistent sizing
 * Matches actual TaskItem component dimensions
 */
const SKELETON_DIMENSIONS = {
  /** Icon size for checkbox and menu (24x24px) */
  ICON_SIZE: 24,
  /** Title text height */
  TITLE_HEIGHT: 24,
  /** Priority badge width */
  BADGE_WIDTH: 70,
  /** Description text height */
  DESC_HEIGHT: 20,
  /** Category label width */
  CATEGORY_WIDTH: 90,
  /** Due date label width */
  DATE_WIDTH: 120,
  /** Metadata text height */
  META_HEIGHT: 16,
} as const

/**
 * Skeleton dimension percentages for responsive widths
 */
const SKELETON_WIDTHS = {
  /** Title text width relative to container */
  TITLE: '45%',
  /** Description text width relative to container */
  DESCRIPTION: '75%',
  /** Last line of multi-line text (natural line ending) */
  LAST_LINE: '60%',
} as const

/**
 * Converts animation boolean to MUI Skeleton animation type
 * Extracted to utility to avoid repetition (DRY principle)
 *
 * @param animated - Whether to show wave animation
 * @returns MUI animation type ('wave' or false)
 */
const getAnimationMode = (animated: boolean): 'wave' | false =>
  animated ? 'wave' : false

/**
 * Props for the LoadingSkeleton component
 *
 * Single interface pattern for simplicity. Each variant extracts relevant props.
 * Consider discriminated unions for stricter type safety if variants diverge significantly.
 */
interface LoadingSkeletonProps {
  /** Skeleton variant to render */
  variant: 'taskCard' | 'taskList' | 'text' | 'circular'
  /** Number of items (taskList variant) */
  count?: number
  /** Enable wave animation (default: true, set false for reduced motion) */
  animated?: boolean
  /** Width dimension (text/circular variants) */
  width?: string | number
  /** Height dimension (circular variant only) */
  height?: number
  /** Number of text lines (text variant, default: 1) */
  lines?: number
}

/**
 * Task card skeleton component
 *
 * Mirrors the structure of TaskItem component for visual consistency during loading.
 * Uses MUI Stack for layout to maintain theme spacing consistency.
 *
 * Structure:
 * - Checkbox (circular, 24x24)
 * - Content area (flex: 1)
 *   - Title + Priority badge row
 *   - Description text
 *   - Metadata row (category + due date)
 * - Menu icon (circular, 24x24)
 *
 * @internal
 */
const TaskCardSkeleton = memo(({ animated = true }: { animated?: boolean }) => {
  const animation = getAnimationMode(animated)

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      {/* Main horizontal layout: checkbox | content | menu */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {/* Checkbox */}
        <Skeleton
          variant="circular"
          width={SKELETON_DIMENSIONS.ICON_SIZE}
          height={SKELETON_DIMENSIONS.ICON_SIZE}
          animation={animation}
        />

        {/* Content area - takes remaining space */}
        <Stack spacing={1} sx={{ flex: 1 }}>
          {/* Title and priority badge */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton
              variant="text"
              width={SKELETON_WIDTHS.TITLE}
              height={SKELETON_DIMENSIONS.TITLE_HEIGHT}
              animation={animation}
            />
            <Skeleton
              variant="rectangular"
              width={SKELETON_DIMENSIONS.BADGE_WIDTH}
              height={SKELETON_DIMENSIONS.TITLE_HEIGHT}
              animation={animation}
              sx={{ borderRadius: 1 }}
            />
          </Stack>

          {/* Description */}
          <Skeleton
            variant="text"
            width={SKELETON_WIDTHS.DESCRIPTION}
            height={SKELETON_DIMENSIONS.DESC_HEIGHT}
            animation={animation}
          />

          {/* Metadata: category and due date */}
          <Stack direction="row" spacing={1.5}>
            <Skeleton
              variant="text"
              width={SKELETON_DIMENSIONS.CATEGORY_WIDTH}
              height={SKELETON_DIMENSIONS.META_HEIGHT}
              animation={animation}
            />
            <Skeleton
              variant="text"
              width={SKELETON_DIMENSIONS.DATE_WIDTH}
              height={SKELETON_DIMENSIONS.META_HEIGHT}
              animation={animation}
            />
          </Stack>
        </Stack>

        {/* Menu icon */}
        <Skeleton
          variant="circular"
          width={SKELETON_DIMENSIONS.ICON_SIZE}
          height={SKELETON_DIMENSIONS.ICON_SIZE}
          animation={animation}
        />
      </Stack>
    </Box>
  )
})

TaskCardSkeleton.displayName = 'TaskCardSkeleton'

/**
 * Task list skeleton component
 *
 * Renders multiple TaskCardSkeleton components with consistent spacing.
 * Used for initial page load and list refresh states.
 *
 * @param count - Number of skeleton cards to render (default: 3)
 * @param animated - Whether to show wave animation
 *
 * @internal
 */
const TaskListSkeleton = memo(
  ({ count = 3, animated = true }: { count?: number; animated?: boolean }) => {
    return (
      <Stack spacing={2}>
        {Array.from({ length: count }, (_, index) => (
          <TaskCardSkeleton key={index} animated={animated} />
        ))}
      </Stack>
    )
  }
)

TaskListSkeleton.displayName = 'TaskListSkeleton'

/**
 * Text skeleton component
 *
 * Renders single or multi-line text placeholders.
 * Multi-line mode automatically reduces last line width to 60% for natural appearance.
 *
 * @param width - Text width (default: '100%')
 * @param lines - Number of lines (default: 1)
 * @param animated - Whether to show wave animation
 *
 * @internal
 */
const TextSkeleton = memo(
  ({
    width = '100%',
    lines = 1,
    animated = true,
  }: {
    width?: string | number
    lines?: number
    animated?: boolean
  }) => {
    const animation = getAnimationMode(animated)

    // Single line optimization: avoid Stack wrapper overhead
    if (lines === 1) {
      return <Skeleton variant="text" width={width} animation={animation} />
    }

    // Multi-line: last line at 60% width mimics natural text ending
    return (
      <Stack spacing={0.5}>
        {Array.from({ length: lines }, (_, index) => {
          const isLastLine = index === lines - 1
          const lineWidth = isLastLine ? SKELETON_WIDTHS.LAST_LINE : width

          return (
            <Skeleton
              key={index}
              variant="text"
              width={lineWidth}
              animation={animation}
            />
          )
        })}
      </Stack>
    )
  }
)

TextSkeleton.displayName = 'TextSkeleton'

/**
 * Circular skeleton component
 *
 * Renders round skeleton for avatars, icons, and circular images.
 * Defaults to 40px if no dimensions provided. Height takes precedence over width.
 *
 * @param width - Diameter in pixels (default: 40)
 * @param height - Diameter in pixels (overrides width if provided)
 * @param animated - Whether to show wave animation
 *
 * @internal
 */
const CircularSkeleton = memo(
  ({
    width = 40,
    height,
    animated = true,
  }: {
    width?: number
    height?: number
    animated?: boolean
  }) => {
    // Height takes precedence for circular shapes (should be same dimension)
    const diameter = height ?? width
    const animation = getAnimationMode(animated)

    return (
      <Skeleton
        variant="circular"
        width={diameter}
        height={diameter}
        animation={animation}
      />
    )
  }
)

CircularSkeleton.displayName = 'CircularSkeleton'

/**
 * Configuration mapping: variant name → render function
 *
 * This pattern eliminates conditional logic and makes adding new variants trivial.
 * Each function extracts only the props relevant to its variant.
 *
 * To add a new variant:
 * 1. Create new sub-component (e.g., CardSkeleton)
 * 2. Add mapping entry here
 * 3. Update LoadingSkeletonProps variant union type
 */
const SKELETON_VARIANTS = {
  taskCard: (props: LoadingSkeletonProps) => (
    <TaskCardSkeleton animated={props.animated} />
  ),
  taskList: (props: LoadingSkeletonProps) => (
    <TaskListSkeleton count={props.count} animated={props.animated} />
  ),
  text: (props: LoadingSkeletonProps) => (
    <TextSkeleton
      width={props.width}
      lines={props.lines}
      animated={props.animated}
    />
  ),
  circular: (props: LoadingSkeletonProps) => (
    <CircularSkeleton
      width={props.width as number | undefined}
      height={props.height}
      animated={props.animated}
    />
  ),
} as const

/**
 * LoadingSkeleton - Configuration-driven skeleton loading component
 *
 * Provides consistent loading states across the application using MUI Skeleton.
 * Architecture follows configuration-driven pattern for extensibility.
 *
 * **Features:**
 * - Four built-in variants (taskCard, taskList, text, circular)
 * - Controllable wave animation (disable for reduced motion accessibility)
 * - Theme-integrated styling (respects dark mode, spacing, colors)
 * - Type-safe variant system
 * - Performance optimized with React.memo
 *
 * **Architecture:**
 * - Configuration object eliminates conditional logic
 * - Each variant is memoized sub-component
 * - Constants reduce magic numbers
 * - Shared utilities (getAnimationMode) enforce DRY
 *
 * **Accessibility:**
 * - Set `animated={false}` for users with motion sensitivity (prefers-reduced-motion)
 * - Consider adding aria-busy="true" to parent containers during loading
 *
 * @example
 * // Task list loading state
 * <LoadingSkeleton variant="taskList" count={5} />
 *
 * @example
 * // Single task card
 * <LoadingSkeleton variant="taskCard" />
 *
 * @example
 * // Multi-line text (last line auto-shortened)
 * <LoadingSkeleton variant="text" lines={3} width="90%" />
 *
 * @example
 * // Avatar placeholder
 * <LoadingSkeleton variant="circular" width={48} />
 *
 * @example
 * // Reduced motion (accessibility)
 * <LoadingSkeleton variant="taskCard" animated={false} />
 */
export const LoadingSkeleton = (props: LoadingSkeletonProps) => {
  const { variant } = props

  // Configuration-driven rendering: no if-else chains
  const renderFn = SKELETON_VARIANTS[variant]

  // Graceful degradation for unknown variants
  if (!renderFn) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[LoadingSkeleton] Unknown variant: "${variant}". Falling back to rectangular skeleton. ` +
          `Valid variants: ${Object.keys(SKELETON_VARIANTS).join(', ')}`
      )
    }
    return <Skeleton variant="rectangular" animation="wave" />
  }

  return renderFn(props)
}
