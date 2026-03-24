import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('admin.dashboard.title', 'Admin Panel')}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t('admin.dashboard.stats.pending_verifications', 'Pending Verifications')}
            value={0}
          />
          <StatCard label={t('admin.dashboard.stats.total_users', 'Total Users')} value={0} />
          <StatCard
            label={t('admin.dashboard.stats.active_listings', 'Active Listings')}
            value={0}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
