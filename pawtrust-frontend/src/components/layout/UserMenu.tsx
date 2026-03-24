import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'

const DASHBOARD_ROUTES: Record<string, string> = {
  buyer: '/buyer/dashboard',
  breeder: '/breeder/dashboard',
  sitter: '/sitter/dashboard',
  admin: '/admin',
}

export function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await useAuthStore.getState().logout()
    } finally {
      navigate('/')
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
        aria-label={user.name}
        aria-expanded={open}
      >
        <span>{user.name}</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <a
            href={DASHBOARD_ROUTES[user.role] ?? '/'}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {t('nav.dashboard', 'Dashboard')}
          </a>
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {t('nav.profile', 'Profile')}
          </a>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoggingOut ? '…' : t('nav.logout', 'Log out')}
          </button>
        </div>
      )}
    </div>
  )
}
