import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'

interface Props {
  listingId: number
}

export function InquiryCTA({ listingId }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/login?redirect=/listings/${listingId}`)}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        {t('listing_detail.inquiry_cta_guest', 'Log in to Submit an Inquiry')}
      </button>
    )
  }

  if (user?.role !== 'buyer') return null

  return (
    <button
      type="button"
      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
    >
      {t('listing_detail.inquiry_cta_buyer', 'Submit Inquiry to Access Contact & Documents')}
    </button>
  )
}
