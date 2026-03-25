import { ListingCard } from './ListingCard'
import { ListingCardSkeleton } from './ListingCardSkeleton'
import type { ListingCard as ListingCardType } from '@/api/listings.api'

interface Props {
  listings: ListingCardType[]
  isLoading: boolean
}

export function ListingGrid({ listings, isLoading }: Props) {
  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
