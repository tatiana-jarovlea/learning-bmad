import { createBrowserRouter, Navigate } from 'react-router-dom'
import RegisterPage from '@/pages/auth/Register'
import { useAuthStore } from '@/store/authStore'

function RedirectIfAuth({ element }: { element: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  if (token && user) {
    const dashboards: Record<string, string> = {
      buyer: '/dashboard',
      breeder: '/breeder/dashboard',
      sitter: '/sitter/dashboard',
      admin: '/admin',
    }
    return <Navigate to={dashboards[user.role] ?? '/dashboard'} replace />
  }
  return <>{element}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>PawTrust Home</div>,
  },
  {
    path: '/register',
    element: <RedirectIfAuth element={<RegisterPage />} />,
  },
  // Placeholder dashboard routes (implemented in Story 1.4)
  { path: '/dashboard', element: <div>Buyer Dashboard</div> },
  { path: '/breeder/dashboard', element: <div>Breeder Dashboard</div> },
  { path: '/sitter/dashboard', element: <div>Sitter Dashboard</div> },
  { path: '/admin', element: <div>Admin Dashboard</div> },
])

export default router
