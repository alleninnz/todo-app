import { z } from 'zod'

// Define the schema for environment variables
// with zod validation and default values
// Export the schema for testing
export const envSchema = z.object({
  VITE_ENABLE_DEBUG: z.coerce.boolean().default(false),
  VITE_ENABLE_MSW: z.coerce.boolean().default(false),
  VITE_API_RETRY_COUNT: z.coerce
    .number()
    .int()
    .min(0, 'Retry count must be at least 0')
    .max(5, 'Retry count must be at most 5')
    .default(3),
  VITE_SNACKBAR_MAX_COUNT: z.coerce
    .number()
    .int()
    .min(1, 'Snackbar max count must be at least 1')
    .max(10, 'Snackbar max count must be at most 10')
    .default(3),
  VITE_SNACKBAR_AUTO_HIDE: z.coerce
    .number()
    .int()
    .min(1000, 'Snackbar auto-hide duration must be at least 1000 ms')
    .max(10000, 'Snackbar auto-hide duration must be at most 10000 ms')
    .default(4000),
  VITE_APP_NAME: z.string().optional().default('TodoAPP'),
  VITE_API_BASE_URL: z.url().default('http://localhost:3000/api'),

  VITE_TIMEOUT: z.coerce
    .number()
    .int()
    .min(1000, 'Timeout must be at least 1000 ms')
    .max(30000, 'Timeout must be at most 30000 ms')
    .default(10000),
})

// Infer the Env type from the schema
type Env = z.infer<typeof envSchema>

// Parse and validate the environment variables
export const parseEnv = (envVars: unknown): Env => {
  const parsedEnv = envSchema.safeParse(envVars)
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
export const env = parseEnv(import.meta.env)
// Export the Env type for use in other parts of the application
export type { Env }
