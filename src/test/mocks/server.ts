import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Shared MSW server instance for unit and integration tests.
export const server = setupServer(...handlers)
