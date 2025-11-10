import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Node.js MSW server for unit and integration tests.
 * Automatically started/stopped by src/test/setup.ts hooks.
 *
 * This instance runs in Node.js environment (Vitest).
 * For browser development, see src/test/mocks/browser.ts instead.
 */
export const server = setupServer(...handlers)
