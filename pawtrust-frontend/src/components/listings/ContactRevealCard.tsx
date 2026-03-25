import { useTranslation } from 'react-i18next'
import type { BreederContact } from '@/api/inquiry.api'

interface Props {
  contact: BreederContact
}

export function ContactRevealCard({ contact }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-green-800">
        {t('inquiry.contact_reveal_title', "Breeder's Contact Details")}
      </h3>
      <div className="space-y-2 text-sm text-gray-800">
        <div>
          <span className="font-medium text-gray-600">{t('inquiry.contact_name', 'Name')}: </span>
          {contact.name}
        </div>
        <div>
          <span className="font-medium text-gray-600">{t('inquiry.contact_email', 'Email')}: </span>
          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
            {contact.email}
          </a>
        </div>
        {contact.phone && (
          <div>
            <span className="font-medium text-gray-600">
              {t('inquiry.contact_phone', 'Phone')}:{' '}
            </span>
            <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
              {contact.phone}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
