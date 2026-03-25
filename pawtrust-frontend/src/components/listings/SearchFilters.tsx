import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ListingSearchParams } from '@/api/listings.api'

interface Props {
  filters: ListingSearchParams
  onChange: (filters: ListingSearchParams) => void
}

const DEBOUNCE_MS = 400

export function SearchFilters({ filters, onChange }: Props) {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState(filters.q ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync keyword if filters.q changes externally (e.g. URL reset)
  useEffect(() => {
    setKeyword(filters.q ?? '')
  }, [filters.q])

  function handleKeyword(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setKeyword(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, q: val || undefined, page: undefined })
    }, DEBOUNCE_MS)
  }

  function set<K extends keyof ListingSearchParams>(key: K, val: ListingSearchParams[K]) {
    onChange({ ...filters, [key]: val, page: undefined })
  }

  const hasFilters =
    !!filters.q ||
    !!filters.species ||
    !!filters.location_city ||
    filters.price_min != null ||
    filters.price_max != null ||
    !!filters.verified_only

  function clearAll() {
    setKeyword('')
    onChange({})
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Keyword */}
      <input
        type="text"
        value={keyword}
        onChange={handleKeyword}
        placeholder={t('search.filters.keyword', 'Search...')}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* Species */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
          {t('search.filters.species', 'Species')}
        </p>
        <div className="flex gap-3">
          {(['', 'dog', 'cat'] as const).map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                name="species"
                value={s}
                checked={(filters.species ?? '') === s}
                onChange={() => set('species', s || undefined)}
                className="accent-blue-600"
              />
              {s === ''
                ? t('search.filters.species_all', 'All')
                : s === 'dog'
                  ? t('search.filters.species_dog', 'Dog')
                  : t('search.filters.species_cat', 'Cat')}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t('search.filters.price_min', 'Min price')}
          </label>
          <input
            type="number"
            min={0}
            value={filters.price_min ?? ''}
            onChange={(e) => set('price_min', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t('search.filters.price_max', 'Max price')}
          </label>
          <input
            type="number"
            min={0}
            value={filters.price_max ?? ''}
            onChange={(e) => set('price_max', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="∞"
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {t('search.filters.location_city', 'City')}
        </label>
        <input
          type="text"
          value={filters.location_city ?? ''}
          onChange={(e) => set('location_city', e.target.value || undefined)}
          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Verified only */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!filters.verified_only}
          onChange={(e) => set('verified_only', e.target.checked || undefined)}
          className="accent-blue-600"
        />
        {t('search.filters.verified_only', 'Verified breeders only')}
      </label>

      {/* Clear */}
      {hasFilters && (
        <button type="button" onClick={clearAll} className="text-sm text-blue-600 hover:underline">
          {t('search.clear_filters', 'Clear all filters')}
        </button>
      )}
    </div>
  )
}
