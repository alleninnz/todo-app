import { describe, it, expect } from 'vitest'
import { createAppTheme, theme } from '../theme'

describe('shared/config/theme', () => {
  describe('createAppTheme', () => {
    it('should create a light theme by default', () => {
      const defaultTheme = createAppTheme()
      expect(defaultTheme.palette.mode).toBe('light')
      expect(defaultTheme.palette.primary.main).toBe('#1976d2')
    })

    it('should create a dark theme when requested', () => {
      const darkTheme = createAppTheme('dark')
      expect(darkTheme.palette.mode).toBe('dark')
      expect(darkTheme.palette.primary.main).toBe('#90caf9')
    })

    it('should have custom neutral color', () => {
      const lightTheme = createAppTheme('light')
      expect(lightTheme.palette.neutral).toBeDefined()
      expect(lightTheme.palette.neutral?.main).toBe('#64748B')
    })

    it('should have custom breakpoints matching Tailwind', () => {
      const t = createAppTheme()
      expect(t.breakpoints.values.sm).toBe(640)
      expect(t.breakpoints.values.md).toBe(768)
      expect(t.breakpoints.values.lg).toBe(1024)
      expect(t.breakpoints.values.xl).toBe(1280)
    })

    it('should have custom shape borderRadius', () => {
      const t = createAppTheme()
      expect(t.shape.borderRadius).toBe(8)
    })

    it('should have component overrides', () => {
      const t = createAppTheme()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buttonStyle = t.components?.MuiButton?.styleOverrides?.root as any
      expect(buttonStyle).toBeDefined()
      expect(buttonStyle.borderRadius).toBe(8)
    })
  })

  describe('default theme export', () => {
    it('should be a light theme', () => {
      expect(theme.palette.mode).toBe('light')
    })
  })
})
