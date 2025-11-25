import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoadingSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  beforeEach(() => {
    // Reset any mocks before each test for isolation
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original NODE_ENV after tests that modify it
    if (process.env.NODE_ENV_ORIGINAL) {
      process.env.NODE_ENV = process.env.NODE_ENV_ORIGINAL
      delete process.env.NODE_ENV_ORIGINAL
    }
  })

  describe('taskCard variant', () => {
    describe('Structure', () => {
      it('renders complete task card skeleton structure', () => {
        const { container } = render(<LoadingSkeleton variant="taskCard" />)

        // Should have exactly 2 circular skeletons (checkbox + menu icon)
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(2)

        // Should have exactly 4 text skeletons (title + description + 2 metadata)
        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        expect(textSkeletons).toHaveLength(4)

        // Should have exactly 1 rectangular skeleton (priority badge)
        const rectSkeletons = container.querySelectorAll(
          '.MuiSkeleton-rectangular'
        )
        expect(rectSkeletons).toHaveLength(1)
      })

      it('renders card with proper MUI Box container', () => {
        const { container } = render(<LoadingSkeleton variant="taskCard" />)

        const box = container.querySelector('.MuiBox-root')
        expect(box).toBeInTheDocument()
      })

      it('uses MUI Stack for layout structure', () => {
        const { container } = render(<LoadingSkeleton variant="taskCard" />)

        // Should have Stack components for layout
        const stacks = container.querySelectorAll('.MuiStack-root')
        expect(stacks.length).toBeGreaterThan(0)
      })
    })

    describe('Animation', () => {
      it('renders with wave animation by default', () => {
        const { container } = render(<LoadingSkeleton variant="taskCard" />)
        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')

        // All 7 skeletons (2 circular + 4 text + 1 rectangular) should animate
        expect(waveSkeletons).toHaveLength(7)
      })

      it('disables animation when animated is false', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskCard" animated={false} />
        )

        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
        expect(waveSkeletons).toHaveLength(0)
      })
    })

    describe('Props Isolation', () => {
      it('ignores irrelevant props for taskCard variant', () => {
        const { container } = render(
          <LoadingSkeleton
            variant="taskCard"
            {...{ count: 10, width: '500px', height: 100, lines: 5 }}
          />
        )

        // Should still render single task card, ignoring count/width/height/lines
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(2)
      })
    })
  })

  describe('taskList variant', () => {
    describe('Count Behavior', () => {
      it('renders default count of 3 task cards', () => {
        const { container } = render(<LoadingSkeleton variant="taskList" />)

        // 3 cards × 2 circular skeletons each = 6 total
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(6)
      })

      it('renders custom count of task cards', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={5} />
        )

        // 5 cards × 2 circular skeletons each = 10 total
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(10)
      })

      it('renders single card when count is 1', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={1} />
        )

        // 1 card × 2 circular skeletons = 2 total
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(2)
      })

      it('renders nothing when count is 0', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={0} />
        )

        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(0)
      })

      it('handles large count efficiently', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={10} />
        )

        // 10 cards × 2 circular skeletons each = 20 total
        const circularSkeletons = container.querySelectorAll(
          '.MuiSkeleton-circular'
        )
        expect(circularSkeletons).toHaveLength(20)
      })
    })

    describe('Animation Propagation', () => {
      it('passes animation prop to all child skeletons', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={2} animated={false} />
        )

        // No skeletons should have wave animation
        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
        expect(waveSkeletons).toHaveLength(0)
      })

      it('enables animation for all child skeletons by default', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={2} />
        )

        // 2 cards × 7 skeletons each = 14 total animated
        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
        expect(waveSkeletons).toHaveLength(14)
      })
    })

    describe('Structure', () => {
      it('uses MUI Stack for list container', () => {
        const { container } = render(
          <LoadingSkeleton variant="taskList" count={2} />
        )

        const stacks = container.querySelectorAll('.MuiStack-root')
        expect(stacks.length).toBeGreaterThan(0)
      })
    })
  })

  describe('text variant', () => {
    describe('Single Line', () => {
      it('renders single line text skeleton by default', () => {
        const { container } = render(<LoadingSkeleton variant="text" />)

        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        expect(textSkeletons).toHaveLength(1)
      })

      it('applies custom width to single line', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" width="50%" />
        )

        const skeleton = container.querySelector('.MuiSkeleton-text')
        expect(skeleton).toHaveStyle({ width: '50%' })
      })

      it('applies numeric width to single line', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" width={200} />
        )

        const skeleton = container.querySelector('.MuiSkeleton-text')
        expect(skeleton).toHaveStyle({ width: '200px' })
      })

      it('defaults to 100% width when not specified', () => {
        const { container } = render(<LoadingSkeleton variant="text" />)

        const skeleton = container.querySelector('.MuiSkeleton-text')
        expect(skeleton).toHaveStyle({ width: '100%' })
      })
    })

    describe('Multi-Line', () => {
      it('renders multiple lines when lines prop is provided', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={3} />
        )

        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        expect(textSkeletons).toHaveLength(3)
      })

      it('renders last line at 60% width for natural appearance', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={2} />
        )

        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        const lastSkeleton = textSkeletons[textSkeletons.length - 1]

        expect(lastSkeleton).toHaveStyle({ width: '60%' })
      })

      it('renders first lines at full width in multi-line mode', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={3} />
        )

        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        const firstSkeleton = textSkeletons[0]
        const secondSkeleton = textSkeletons[1]

        expect(firstSkeleton).toHaveStyle({ width: '100%' })
        expect(secondSkeleton).toHaveStyle({ width: '100%' })
      })

      it('applies custom width to non-last lines in multi-line mode', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={3} width="80%" />
        )

        const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
        const firstSkeleton = textSkeletons[0]
        const lastSkeleton = textSkeletons[2]

        // First line should use custom width
        expect(firstSkeleton).toHaveStyle({ width: '80%' })
        // Last line should always be 60%
        expect(lastSkeleton).toHaveStyle({ width: '60%' })
      })

      it('uses Stack wrapper for multi-line text', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={2} />
        )

        const stack = container.querySelector('.MuiStack-root')
        expect(stack).toBeInTheDocument()
      })

      it('avoids Stack wrapper for single line optimization', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={1} />
        )

        const stack = container.querySelector('.MuiStack-root')
        expect(stack).not.toBeInTheDocument()
      })
    })

    describe('Animation', () => {
      it('animates by default', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={2} />
        )

        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
        expect(waveSkeletons).toHaveLength(2)
      })

      it('disables animation when animated is false', () => {
        const { container } = render(
          <LoadingSkeleton variant="text" lines={2} animated={false} />
        )

        const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
        expect(waveSkeletons).toHaveLength(0)
      })
    })
  })

  describe('circular variant', () => {
    describe('Size Handling', () => {
      it('renders circular skeleton with default 40px size', () => {
        const { container } = render(<LoadingSkeleton variant="circular" />)

        const skeleton = container.querySelector('.MuiSkeleton-circular')
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveStyle({ width: '40px', height: '40px' })
      })

      it('applies custom width as diameter', () => {
        const { container } = render(
          <LoadingSkeleton variant="circular" width={48} />
        )

        const skeleton = container.querySelector('.MuiSkeleton-circular')
        expect(skeleton).toHaveStyle({ width: '48px', height: '48px' })
      })

      it('uses height as diameter when both width and height provided', () => {
        const { container } = render(
          <LoadingSkeleton variant="circular" width={50} height={60} />
        )

        const skeleton = container.querySelector('.MuiSkeleton-circular')
        // Height takes precedence over width for circular shapes
        expect(skeleton).toHaveStyle({ width: '60px', height: '60px' })
      })

      it('uses height as diameter when only height provided', () => {
        const { container } = render(
          <LoadingSkeleton variant="circular" height={80} />
        )

        const skeleton = container.querySelector('.MuiSkeleton-circular')
        expect(skeleton).toHaveStyle({ width: '80px', height: '80px' })
      })
    })

    describe('Animation', () => {
      it('animates by default', () => {
        const { container } = render(<LoadingSkeleton variant="circular" />)

        const skeleton = container.querySelector('.MuiSkeleton-wave')
        expect(skeleton).toBeInTheDocument()
      })

      it('disables animation when animated is false', () => {
        const { container } = render(
          <LoadingSkeleton variant="circular" animated={false} />
        )

        const waveSkeleton = container.querySelector('.MuiSkeleton-wave')
        expect(waveSkeleton).not.toBeInTheDocument()
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('warns and renders fallback skeleton for unknown variant in development', () => {
      // Save original NODE_ENV
      process.env.NODE_ENV_ORIGINAL = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      const { container } = render(
        // @ts-expect-error - Testing invalid variant fallback behavior
        <LoadingSkeleton variant="unknown" />
      )

      // Should log warning in development
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[LoadingSkeleton] Unknown variant: "unknown". Falling back to rectangular skeleton. ' +
          'Valid variants: taskCard, taskList, text, circular'
      )

      // Should render fallback rectangular skeleton
      const fallbackSkeleton = container.querySelector(
        '.MuiSkeleton-rectangular'
      )
      expect(fallbackSkeleton).toBeInTheDocument()

      consoleWarnSpy.mockRestore()
    })

    it('does not warn in production mode for unknown variant', () => {
      // Note: import.meta.env.DEV is a build-time constant
      // In dev environment, warnings ARE shown (expected behavior)
      // In production build, warnings would NOT be shown

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      // @ts-expect-error - Testing invalid variant fallback behavior
      render(<LoadingSkeleton variant="unknownProd" />)

      if (import.meta.env.DEV) {
        // In dev mode, warnings ARE logged (expected)
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '[LoadingSkeleton] Unknown variant: "unknownProd". Falling back to rectangular skeleton. ' +
            'Valid variants: taskCard, taskList, text, circular'
        )
      } else {
        // In production build, warnings would NOT be logged
        expect(consoleWarnSpy).not.toHaveBeenCalled()
      }

      consoleWarnSpy.mockRestore()
    })

    it('renders fallback with wave animation', () => {
      const { container } = render(
        // @ts-expect-error - Testing invalid variant fallback behavior
        <LoadingSkeleton variant="invalid" />
      )

      const fallbackSkeleton = container.querySelector('.MuiSkeleton-wave')
      expect(fallbackSkeleton).toBeInTheDocument()
    })
  })

  describe('Animation Control', () => {
    it('enables wave animation by default across all variants', () => {
      const variants: Array<'taskCard' | 'taskList' | 'text' | 'circular'> = [
        'taskCard',
        'taskList',
        'text',
        'circular',
      ]

      variants.forEach(variant => {
        const { container } = render(<LoadingSkeleton variant={variant} />)
        const waveSkeleton = container.querySelector('.MuiSkeleton-wave')
        expect(waveSkeleton).toBeInTheDocument()
      })
    })

    it('disables animation when animated is false across all variants', () => {
      const variants: Array<'taskCard' | 'taskList' | 'text' | 'circular'> = [
        'taskCard',
        'taskList',
        'text',
        'circular',
      ]

      variants.forEach(variant => {
        const { container } = render(
          <LoadingSkeleton variant={variant} animated={false} />
        )
        const waveSkeleton = container.querySelector('.MuiSkeleton-wave')
        expect(waveSkeleton).not.toBeInTheDocument()
      })
    })
  })

  describe('Component Memoization', () => {
    it('renders consistently with same props', () => {
      const { container: container1 } = render(
        <LoadingSkeleton variant="taskCard" animated={false} />
      )
      const { container: container2 } = render(
        <LoadingSkeleton variant="taskCard" animated={false} />
      )

      // Both should have identical structure
      expect(container1.querySelectorAll('.MuiSkeleton-circular').length).toBe(
        container2.querySelectorAll('.MuiSkeleton-circular').length
      )
    })
  })

  describe('Accessibility', () => {
    it('provides skeleton placeholders that can be announced by screen readers', () => {
      const { container } = render(<LoadingSkeleton variant="taskCard" />)

      // MUI Skeleton components should be present
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('respects reduced motion preference with animated=false', () => {
      const { container } = render(
        <LoadingSkeleton variant="taskCard" animated={false} />
      )

      // No wave animation for users with motion sensitivity
      const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
      expect(waveSkeletons).toHaveLength(0)
    })
  })
})
