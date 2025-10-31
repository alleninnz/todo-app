import ErrorPage from '@/shared/ui/ErrorPage'
import TasksPage from '@pages/TasksPage'
import AppLayout from '@shared/ui/AppLayout'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
