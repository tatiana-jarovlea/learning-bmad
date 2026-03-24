import { useAuthStore } from '@/store/authStore'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type Role = 'buyer' | 'breeder' | 'sitter' | 'admin'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const role = (user?.role ?? 'buyer') as Role

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
      </div>
    </div>
  )
}
