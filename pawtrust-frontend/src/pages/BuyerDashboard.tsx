import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'

export default function BuyerDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('buyer.dashboard.title', 'My Dashboard')}
        </h1>
        {user && (
          <p className="text-gray-500 mb-6">
            {t('buyer.dashboard.welcome', 'Welcome back, {{name}}', { name: user.name })}
          </p>
        )}
        <p className="text-gray-600">
          {t('buyer.dashboard.empty_state', 'No inquiries yet.')}{' '}
          <Link to="/search" className="text-blue-600 hover:underline">
            {t('nav.browse_listings', 'Browse listings')}
          </Link>{' '}
          to find your perfect pet.
        </p>
      </div>
    </DashboardLayout>
  )
}
