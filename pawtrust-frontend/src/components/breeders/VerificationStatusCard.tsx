import { useTranslation } from 'react-i18next'
import type { VerificationStatusResponse } from '@/api/breeders.api'

interface Props {
  status: VerificationStatusResponse
  onSubmitClick: () => void
}

const STATUS_STYLES: Record<string, string> = {
  not_submitted: 'bg-gray-100 border-gray-300 text-gray-700',
  pending: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  under_review: 'bg-blue-50 border-blue-300 text-blue-800',
  verified: 'bg-green-50 border-green-300 text-green-800',
  rejected: 'bg-red-50 border-red-300 text-red-800',
}

export default function VerificationStatusCard({ status, onSubmitClick }: Props) {
  const { t } = useTranslation()
  const styles = STATUS_STYLES[status.status] ?? STATUS_STYLES.not_submitted

  return (
    <div className={`border rounded-lg p-4 ${styles}`}>
      <p className="font-semibold text-sm mb-1">{t(`verification.status.${status.status}`)}</p>

      {status.status === 'rejected' && status.admin_notes && (
        <p className="text-sm mt-1">
          <span className="font-medium">{t('verification.admin_notes_label')}</span>{' '}
          {status.admin_notes}
        </p>
      )}

      {(status.status === 'not_submitted' || status.status === 'rejected') && (
        <button
          type="button"
          onClick={onSubmitClick}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          {status.status === 'rejected'
            ? t('verification.cta_resubmit')
            : t('verification.cta_submit')}
        </button>
      )}
    </div>
  )
}
