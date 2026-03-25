import { useTranslation } from 'react-i18next'

interface VerifiedBadgeProps {
  verified: boolean
  size?: 'sm' | 'md'
}

const CheckIcon = () => (
  <svg
    className="shrink-0"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10.28 3.28a.75.75 0 0 0-1.06-1.06L4.75 6.69 2.78 4.72a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5Z"
      clipRule="evenodd"
    />
  </svg>
)

const InfoIcon = () => (
  <svg
    className="shrink-0"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1ZM6 4a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 4Zm-.75 1a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0V5Z"
      clipRule="evenodd"
    />
  </svg>
)

export function VerifiedBadge({ verified, size = 'sm' }: VerifiedBadgeProps) {
  const { t } = useTranslation()

  const gapClass = size === 'md' ? 'gap-1.5' : 'gap-1'
  const textClass = size === 'md' ? 'text-sm' : 'text-xs'
  const paddingClass = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5'

  if (verified) {
    const label = t('badge.verified_label', 'Verified')
    const tooltip = t('badge.verified_tooltip', 'This breeder has been verified by PawTrust')

    return (
      <span
        className={`inline-flex items-center ${gapClass} ${paddingClass} rounded-full ${textClass} font-medium bg-green-100 text-green-800 border border-green-300`}
        title={tooltip}
        aria-label={tooltip}
        role="status"
      >
        <CheckIcon />
        {label}
      </span>
    )
  }

  const label = t('badge.unverified_label', 'Unverified')
  const tooltip = t('badge.unverified_tooltip', 'This breeder has not yet been verified')

  return (
    <span
      className={`inline-flex items-center ${gapClass} ${paddingClass} rounded-full ${textClass} font-medium bg-gray-100 text-gray-500 border border-gray-200`}
      title={tooltip}
      aria-label={tooltip}
      role="status"
    >
      <InfoIcon />
      {label}
    </span>
  )
}
