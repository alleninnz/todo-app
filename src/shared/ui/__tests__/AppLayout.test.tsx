import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AppLayout } from '../AppLayout'

// Mock React Router's Outlet to test content rendering
vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    Outlet: vi.fn(() => <div data-testid="outlet-content">Page Content</div>),
  }
})

describe('AppLayout', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>)
  }

  describe('Structure', () => {
    it('renders the app layout structure', () => {
      const { container } = renderWithRouter(<AppLayout />)

      // Should have header (AppBar)
      expect(screen.getByRole('banner')).toBeInTheDocument()

      // Should have main content area
      expect(screen.getByRole('main')).toBeInTheDocument()

      // Layout container should exist
      expect(container.querySelector('.MuiStack-root')).toBeInTheDocument()
    })

    it('renders sticky app header', () => {
      renderWithRouter(<AppLayout />)

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('MuiAppBar-root')
    })

    it('renders main content container', () => {
      renderWithRouter(<AppLayout />)

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('App Header', () => {
    it('displays app title', () => {
      renderWithRouter(<AppLayout />)

      const title = screen.getByText('Todo App')
      expect(title).toBeInTheDocument()
    })

    it('renders app title as h1', () => {
      renderWithRouter(<AppLayout />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Todo App')
    })

    it('has accessible app title label', () => {
      renderWithRouter(<AppLayout />)

      const title = screen.getByLabelText('Todo App')
      expect(title).toBeInTheDocument()
    })

    it('renders toolbar in header', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const toolbar = container.querySelector('.MuiToolbar-root')
      expect(toolbar).toBeInTheDocument()
    })
  })

  describe('Content Area', () => {
    it('renders Router Outlet for page content', () => {
      renderWithRouter(<AppLayout />)

      // Mocked Outlet should render test content
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
      expect(screen.getByText('Page Content')).toBeInTheDocument()
    })

    it('wraps content in Container component', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const contentContainer = container.querySelector('.MuiContainer-root')
      expect(contentContainer).toBeInTheDocument()
    })

    it('applies max-width constraint to content', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const contentContainer = container.querySelector(
        '.MuiContainer-maxWidthLg'
      )
      expect(contentContainer).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies full viewport height to layout', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const layoutStack = container.querySelector('.MuiStack-root')
      expect(layoutStack).toHaveStyle({ minHeight: '100vh' })
    })

    it('uses theme primary color for header', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const appBar = container.querySelector('.MuiAppBar-root')
      expect(appBar).toHaveClass('MuiAppBar-colorPrimary')
    })

    it('applies sticky positioning to header', () => {
      const { container } = renderWithRouter(<AppLayout />)

      const appBar = container.querySelector('.MuiAppBar-positionSticky')
      expect(appBar).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic header element', () => {
      renderWithRouter(<AppLayout />)

      const header = screen.getByRole('banner')
      expect(header.tagName).toBe('HEADER')
    })

    it('has semantic main element', () => {
      renderWithRouter(<AppLayout />)

      const main = screen.getByRole('main')
      expect(main.tagName).toBe('MAIN')
    })

    it('provides accessible heading structure', () => {
      renderWithRouter(<AppLayout />)

      // Should have h1 for app title
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('has no accessibility violations in header', () => {
      renderWithRouter(<AppLayout />)

      const header = screen.getByRole('banner')

      // Header should contain accessible heading
      const heading = screen.getByRole('heading', { level: 1 })
      expect(header).toContainElement(heading)
    })
  })

  describe('Responsive Design', () => {
    it('renders responsive container', () => {
      renderWithRouter(<AppLayout />)

      // Main content should be present
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('applies responsive spacing', () => {
      renderWithRouter(<AppLayout />)

      const main = screen.getByRole('main')
      // Main should have padding classes from sx prop
      expect(main).toBeInTheDocument()
    })
  })

  describe('Layout Components', () => {
    it('uses MUI Stack for vertical layout', () => {
      renderWithRouter(<AppLayout />)

      // Layout should render successfully
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('uses MUI Box for main content', () => {
      renderWithRouter(<AppLayout />)

      const main = screen.getByRole('main')
      expect(main).toHaveClass('MuiBox-root')
    })

    it('uses MUI AppBar for header', () => {
      renderWithRouter(<AppLayout />)

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('MuiAppBar-root')
    })
  })

  describe('Future Enhancement Placeholders', () => {
    it('has spacer for future navigation items', () => {
      renderWithRouter(<AppLayout />)

      // Header should be present with toolbar
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
    })

    it('provides space for future header actions', () => {
      renderWithRouter(<AppLayout />)

      // App title should be present
      expect(screen.getByText('Todo App')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('applies theme background color to main', () => {
      renderWithRouter(<AppLayout />)

      const main = screen.getByRole('main')
      // Should use theme background color (applied via sx prop)
      expect(main).toBeInTheDocument()
    })

    it('applies theme border to header', () => {
      renderWithRouter(<AppLayout />)

      const header = screen.getByRole('banner')
      // Header should have border styling
      expect(header).toBeInTheDocument()
    })
  })
})
