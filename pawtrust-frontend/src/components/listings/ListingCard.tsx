import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ListingCard as ListingCardType } from '@/api/listings.api'

interface Props {
  listing: ListingCardType
}

export function ListingCard({ listing }: Props) {
  const { t } = useTranslation()

  const formattedPrice = new Intl.NumberFormat('ro-MD', {
    style: 'currency',
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(Number(listing.price))

  return (
    <Link
      to={`/listings/${listing.id}`}
      role="article"
      aria-label={listing.title}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {listing.main_photo_url ? (
          <img
            src={listing.main_photo_url}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🐾
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {listing.featured && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
              {t('listing_card.featured', 'Featured')}
            </span>
          )}
          {listing.verified && (
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
              ✓ {t('listing_card.verified', 'Verified')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
          {listing.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate capitalize">{listing.breed}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-blue-600 font-bold text-sm">{formattedPrice}</span>
          {listing.location && (
            <span className="text-xs text-gray-400 truncate max-w-[50%]">
              📍 {listing.location}
            </span>
          )}
        </div>
        {listing.breeder_name && (
          <p className="text-xs text-gray-400 mt-1 truncate">{listing.breeder_name}</p>
        )}
      </div>
    </Link>
  )
}
