import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CreateListingForm } from '@/components/listings/CreateListingForm'

export default function CreateListingPage() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link
            to="/breeder/dashboard"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← {t('breeder.dashboard.title', 'Breeder Dashboard')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {t('listing.create.title', 'Create a New Listing')}
          </h1>
        </div>
        <CreateListingForm />
      </div>
    </DashboardLayout>
  )
}
