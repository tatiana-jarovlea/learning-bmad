import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { LocaleSwitcher } from './LocaleSwitcher'
import { UserMenu } from './UserMenu'

export function Header() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-6">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">
        PawTrust
      </Link>

      {/* Center nav */}
      <nav className="hidden md:flex items-center gap-6 flex-1">
        <Link to="/search" className="text-sm text-gray-600 hover:text-gray-900">
          {t('nav.browse_listings', 'Browse Listings')}
        </Link>
        <Link to="/sitters" className="text-sm text-gray-600 hover:text-gray-900">
          {t('nav.pet_sitters', 'Pet Sitters')}
        </Link>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <LocaleSwitcher />
        {token ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              {t('nav.login', 'Log in')}
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('nav.register', 'Register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
