import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchListings, type ListingSearchParams } from '@/api/listings.api'

export const useListings = (params: ListingSearchParams) =>
  useQuery({
    queryKey: ['listings', params],
    queryFn: () => searchListings(params).then((r) => r.data),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
