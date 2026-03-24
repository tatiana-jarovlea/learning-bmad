import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getPublicBreederProfile } from '@/api/breeders.api'

function ProfileSkeleton() {
  return (
    <div className="animate-pulse p-6 max-w-4xl mx-auto">
      <div className="flex gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  )
}

export default function BreederProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['publicBreederProfile', id],
    queryFn: () => getPublicBreederProfile(Number(id)).then((r) => r.data.data),
    retry: false,
  })

  if (isLoading) return <ProfileSkeleton />

  const is404 =
    isError &&
    'response' in (error as object) &&
    (error as { response?: { status?: number } }).response?.status === 404

  if (is404) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-600">
          {t('breeder.profile.not_found', 'Profile not found')}
        </p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">
          {t('common.go_back', 'Go back')}
        </button>
      </div>
    )
  }

  if (isError || !data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row gap-6">
          {/* Photo */}
          {data.profile_photo_url ? (
            <img
              src={data.profile_photo_url}
              alt={data.kennel_name ?? ''}
              className="w-24 h-24 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold shrink-0">
              {(data.kennel_name ?? '?')[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.kennel_name ?? t('breeder.profile.unnamed', 'Unnamed Kennel')}
              </h1>
              {data.verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  ✓ {t('breeder.profile.verified', 'Verified by PawTrust')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  {t('breeder.profile.not_verified', 'Not yet verified')}
                </span>
              )}
            </div>

            {data.location && <p className="text-gray-500 text-sm mt-1">📍 {data.location}</p>}
            {data.years_active != null && (
              <p className="text-gray-500 text-sm">
                {t('breeder.profile.years_active', '{{n}} years active', { n: data.years_active })}
              </p>
            )}
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline mt-1 inline-block"
              >
                {data.website}
              </a>
            )}
          </div>
        </div>

        {/* Breed specializations */}
        {data.breed_specialization && data.breed_specialization.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {t('breeder.profile.specializations', 'Breed Specializations')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.breed_specialization.map((b) => (
                <span key={b} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {t('breeder.profile.about', 'About')}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{data.description}</p>
          </div>
        )}

        {/* Active Listings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t('breeder.profile.active_listings', 'Active Listings')}
          </h2>
          {!data.listings || data.listings.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {t('breeder.profile.no_listings', 'No active listings at the moment.')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.listings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {listing.title ?? `Listing #${listing.id}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
