import { createBrowserRouter } from 'react-router-dom'

import { ErrorPage } from '@/shared/ui/ErrorPage'
import { TasksPage } from '@pages/TasksPage'
import { AppLayout } from '@shared/ui/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <TasksPage />,
      },
      {
        path: '*',
        element: <ErrorPage statusCode={404} />,
      },
    ],
  },
])
