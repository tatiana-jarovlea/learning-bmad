import { Link } from 'react-router-dom'
import type { BreederSummary } from '@/api/listings.api'

interface Props {
  breeder: BreederSummary
}

export function BreederSummaryCard({ breeder }: Props) {
  const displayName = breeder.kennel_name ?? breeder.display_name ?? 'Unknown Kennel'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Profile photo / avatar */}
      <div className="flex items-center gap-3 mb-3">
        {breeder.profile_photo_url ? (
          <img
            src={breeder.profile_photo_url}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{displayName}</p>
          {breeder.verified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Location */}
      {breeder.location && <p className="text-sm text-gray-500 mb-2">📍 {breeder.location}</p>}

      {/* Breed specializations */}
      {breeder.breed_specialization && breeder.breed_specialization.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {breeder.breed_specialization.map((b) => (
            <span key={b} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Achievement count */}
      {breeder.achievements_count > 0 && (
        <p className="text-sm text-amber-700 mb-3">
          🏆 {breeder.achievements_count} cynology achievements
        </p>
      )}

      <Link
        to={`/breeders/${breeder.id}`}
        className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
      >
        View Full Profile →
      </Link>
    </div>
  )
}
