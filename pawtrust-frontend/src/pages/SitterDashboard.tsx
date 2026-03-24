import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function SitterDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('sitter.dashboard.title', 'Pet Sitter Dashboard')}
        </h1>
        <p className="text-gray-600">
          {t('sitter.dashboard.coming_soon', 'This section is coming soon.')}
        </p>
      </div>
    </DashboardLayout>
  )
}
