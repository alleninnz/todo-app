import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ErrorPage from '../ErrorPage'

describe('ErrorPage', () => {
  it('shows a not found message when status code is 404', () => {
    render(<ErrorPage statusCode={404} />)

    expect(screen.getByText('404 Not Found')).toBeInTheDocument()
  })

  it('shows a generic error message when no status code is provided', () => {
    render(<ErrorPage />)

    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })
})
