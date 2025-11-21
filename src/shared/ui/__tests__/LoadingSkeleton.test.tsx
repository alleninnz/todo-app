import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoadingSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  describe('taskCard variant', () => {
    it('renders task card skeleton structure', () => {
      const { container } = render(<LoadingSkeleton variant="taskCard" />)

      // Should have circular skeletons for checkbox and menu icon (2 total)
      const circularSkeletons = container.querySelectorAll(
        '.MuiSkeleton-circular'
      )
      expect(circularSkeletons).toHaveLength(2)

      // Should have text skeletons for title, description, and metadata
      const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
      expect(textSkeletons.length).toBeGreaterThan(0)

      // Should have rectangular skeleton for priority badge
      const rectSkeletons = container.querySelectorAll(
        '.MuiSkeleton-rectangular'
      )
      expect(rectSkeletons).toHaveLength(1)
    })

    it('renders with wave animation by default', () => {
      const { container } = render(<LoadingSkeleton variant="taskCard" />)
      const skeleton = container.querySelector('.MuiSkeleton-wave')
      expect(skeleton).toBeInTheDocument()
    })

    it('disables animation when animated is false', () => {
      const { container } = render(
        <LoadingSkeleton variant="taskCard" animated={false} />
      )
      const waveSkeleton = container.querySelector('.MuiSkeleton-wave')
      expect(waveSkeleton).not.toBeInTheDocument()
    })
  })

  describe('taskList variant', () => {
    it('renders default count of 3 task cards', () => {
      const { container } = render(<LoadingSkeleton variant="taskList" />)

      // Each task card has 2 circular skeletons, so 3 cards = 6 total
      const circularSkeletons = container.querySelectorAll(
        '.MuiSkeleton-circular'
      )
      expect(circularSkeletons).toHaveLength(6)
    })

    it('renders custom count of task cards', () => {
      const { container } = render(
        <LoadingSkeleton variant="taskList" count={5} />
      )

      // 5 task cards × 2 circular skeletons each = 10 total
      const circularSkeletons = container.querySelectorAll(
        '.MuiSkeleton-circular'
      )
      expect(circularSkeletons).toHaveLength(10)
    })

    it('passes animation prop to child skeletons', () => {
      const { container } = render(
        <LoadingSkeleton variant="taskList" count={2} animated={false} />
      )

      const waveSkeletons = container.querySelectorAll('.MuiSkeleton-wave')
      expect(waveSkeletons).toHaveLength(0)
    })
  })

  describe('text variant', () => {
    it('renders single line text skeleton by default', () => {
      const { container } = render(<LoadingSkeleton variant="text" />)

      const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
      expect(textSkeletons).toHaveLength(1)
    })

    it('renders multiple lines when lines prop is provided', () => {
      const { container } = render(<LoadingSkeleton variant="text" lines={3} />)

      const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
      expect(textSkeletons).toHaveLength(3)
    })

    it('applies custom width to single line', () => {
      const { container } = render(
        <LoadingSkeleton variant="text" width="50%" />
      )

      const skeleton = container.querySelector('.MuiSkeleton-text')
      expect(skeleton).toHaveStyle({ width: '50%' })
    })

    it('renders last line at 60% width for multi-line text', () => {
      const { container } = render(<LoadingSkeleton variant="text" lines={2} />)

      const textSkeletons = container.querySelectorAll('.MuiSkeleton-text')
      const lastSkeleton = textSkeletons[textSkeletons.length - 1]

      // Last line should be 60% width
      expect(lastSkeleton).toHaveStyle({ width: '60%' })
    })
  })

  describe('circular variant', () => {
    it('renders circular skeleton with default size', () => {
      const { container } = render(<LoadingSkeleton variant="circular" />)

      const skeleton = container.querySelector('.MuiSkeleton-circular')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveStyle({ width: '40px', height: '40px' })
    })

    it('renders with custom width', () => {
      const { container } = render(
        <LoadingSkeleton variant="circular" width={48} />
      )

      const skeleton = container.querySelector('.MuiSkeleton-circular')
      expect(skeleton).toHaveStyle({ width: '48px', height: '48px' })
    })

    it('renders with custom width and height', () => {
      const { container } = render(
        <LoadingSkeleton variant="circular" width={50} height={60} />
      )

      const skeleton = container.querySelector('.MuiSkeleton-circular')
      expect(skeleton).toHaveStyle({ width: '60px', height: '60px' })
    })
  })

  describe('fallback behavior', () => {
    it('warns and renders fallback skeleton for unknown variant', () => {
      // Mock development environment to trigger warning
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      const { container } = render(
        // @ts-expect-error Testing invalid variant
        <LoadingSkeleton variant="unknown" />
      )

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[LoadingSkeleton] Unknown variant: "unknown". Falling back to rectangular skeleton. ' +
          'Valid variants: taskCard, taskList, text, circular'
      )

      const fallbackSkeleton = container.querySelector(
        '.MuiSkeleton-rectangular'
      )
      expect(fallbackSkeleton).toBeInTheDocument()

      consoleWarnSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('animation control', () => {
    it('enables wave animation by default across all variants', () => {
      const variants: Array<'taskCard' | 'taskList' | 'text' | 'circular'> = [
        'taskCard',
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
})
