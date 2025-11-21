/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Development & Debugging
  readonly VITE_ENABLE_DEBUG: string

  // Feature Flags (Optional)
  readonly VITE_ENABLE_MSW?: string

  // Performance & Network
  readonly VITE_API_RETRY_COUNT: string

  // UI Configuration (Optional)
  readonly VITE_SNACKBAR_MAX_COUNT?: string
  readonly VITE_SNACKBAR_AUTO_HIDE?: string

  // Application Settings
  readonly VITE_APP_NAME?: string

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
