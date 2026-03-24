import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { getMyBreederProfile } from '@/api/breeders.api'
import { BreederProfileForm } from '@/components/breeders/BreederProfileForm'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default function BreederDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [showProfileForm, setShowProfileForm] = useState(false)

  const { data: profileData } = useQuery({
    queryKey: ['myBreederProfile'],
    queryFn: () => getMyBreederProfile().then((r) => r.data.data),
    retry: false,
  })

  const isProfileComplete =
    user?.profile_complete ?? (profileData?.kennel_name != null && profileData.kennel_name !== '')

  if (showProfileForm) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl">
          <button
            onClick={() => setShowProfileForm(false)}
            className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
          >
            ← {t('common.back', 'Back')}
          </button>
          <BreederProfileForm onSuccess={() => setShowProfileForm(false)} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('breeder.dashboard.title', 'Breeder Dashboard')}
        </h1>
        {user && (
          <p className="text-gray-500 mb-6">
            {t('breeder.dashboard.welcome', 'Welcome back, {{name}}', { name: user.name })}
          </p>
        )}

        {!isProfileComplete && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-yellow-800 text-sm">
              {t(
                'breeder.dashboard.profile_incomplete',
                'Complete your breeder profile to attract buyers and list animals.'
              )}
            </p>
            <button
              onClick={() => setShowProfileForm(true)}
              className="shrink-0 px-4 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
            >
              {t('breeder.dashboard.complete_profile', 'Complete profile →')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label={t('breeder.dashboard.stats.active_listings', 'Active Listings')}
            value={0}
          />
          <StatCard
            label={t('breeder.dashboard.stats.pending_inquiries', 'Pending Inquiries')}
            value={0}
          />
          <StatCard
            label={t('breeder.dashboard.stats.verified', 'Verified')}
            value={t('common.no', 'No')}
          />
        </div>

        <p className="text-gray-600">
          {t(
            'breeder.dashboard.empty_state',
            'No listings yet. Create your first listing to start receiving inquiries.'
          )}
        </p>
      </div>
    </DashboardLayout>
  )
}
