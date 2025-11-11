import type { ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => {
  return <>{children}</>
}
