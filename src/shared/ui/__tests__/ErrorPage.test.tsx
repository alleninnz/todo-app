import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as ReactRouterDom from 'react-router-dom'
import { ErrorPage } from '../ErrorPage'

// Mock React Router DOM hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom')
  return {
    ...actual,
    useRouteError: vi.fn(),
    useNavigate: vi.fn(),
  }
})

describe('ErrorPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Provide default mock implementations
    vi.mocked(ReactRouterDom.useRouteError).mockReturnValue(undefined)
    vi.mocked(ReactRouterDom.useNavigate).mockReturnValue(vi.fn())
  })

  it('shows a not found message when status code is 404', () => {
    render(<ErrorPage statusCode={404} />)

    // Status code and title are in separate elements
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('shows a generic error message when no status code is provided', () => {
    render(<ErrorPage />)

    // Defaults to 500 status code with Internal Server Error message
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Internal Server Error')).toBeInTheDocument()
  })
})
