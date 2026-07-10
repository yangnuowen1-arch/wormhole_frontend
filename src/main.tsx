import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './Layout.tsx'
import Login from './pages/Login/index.tsx'
import Users from './pages/Users/index.tsx'
import { loginLoader, requireAuthLoader } from './router/auth'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, loader: () => redirect('/users') },
      { path: 'login', loader: loginLoader, element: <Login /> },
      {
        id: 'protected',
        loader: requireAuthLoader,
        children: [{ path: 'users', element: <Users /> }],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
