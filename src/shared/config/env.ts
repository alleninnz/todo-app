import { z } from 'zod'

// Define the schema for environment variables
// with zod validation and default values
const envSchema = z.object({
  VITE_API_BASE_URL: z.url().default('http://localhost:3000'),
  VITE_APP_NAME: z.string().optional().default('TodoAPP'),
  VITE_TIMEOUT: z.coerce
    .number()
    .int()
    .min(1000, 'Timeout must be at least 1000 ms')
    .max(30000, 'Timeout must be at most 30000 ms')
    .default(10000),
  VITE_ENABLE_DEBUG: z.coerce.boolean().default(false),
})

// Infer the Env type from the schema
type Env = z.infer<typeof envSchema>

// Parse and validate the environment variables
function parseEnv(): Env {
  const parsedEnv = envSchema.safeParse(import.meta.env)
  if (!parsedEnv.success) {
    console.error(
      '❌ Invalid environment variables:',
      z.treeifyError(parsedEnv.error)
    )
    throw new Error('Invalid environment variables')
  }

  if (parsedEnv.data.VITE_ENABLE_DEBUG) {
    console.log('✅ Environment variables loaded successfully:', parsedEnv.data)
  }
  return parsedEnv.data
}

// Export the validated environment variables
export const env = parseEnv()
// Export the Env type for use in other parts of the application
export type { Env }
