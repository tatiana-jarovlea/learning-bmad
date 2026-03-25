import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import axiosClient from '@/api/axiosClient'
import {
  createListing,
  uploadListingPhoto,
  uploadHealthCertificate,
  type CreateListingPayload,
  type Listing,
} from '@/api/listings.api'
import { getMyBreederProfile } from '@/api/breeders.api'

interface Breed {
  id: number
  name_ro: string
  name_ru: string
  species: 'dog' | 'cat' | 'other'
}

interface Step1Fields {
  title: string
  description: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  gender: 'male' | 'female'
  date_of_birth: string
  price: number
  currency: 'EUR' | 'MDL' | 'RON'
  location: string
  listing_type: 'standard' | 'featured'
}

const LISTING_PRICES: Record<string, number> = {
  standard: 3,
  featured: 8,
}

export function CreateListingForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [listing, setListing] = useState<Listing | null>(null)
  const [listingPhotos, setListingPhotos] = useState<File[]>([])
  const [parentPhotos, setParentPhotos] = useState<File[]>([])
  const [healthCertFile, setHealthCertFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const listingPhotoRef = useRef<HTMLInputElement>(null)
  const parentPhotoRef = useRef<HTMLInputElement>(null)
  const certRef = useRef<HTMLInputElement>(null)

  const { data: profileData } = useQuery({
    queryKey: ['myBreederProfile'],
    queryFn: () => getMyBreederProfile().then((r) => r.data.data),
    retry: false,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Fields>({
    defaultValues: {
      currency: 'EUR',
      listing_type: 'standard',
      location: profileData?.location ?? '',
    },
  })

  const selectedSpecies = watch('species')
  const selectedListingType = watch('listing_type')
  const descValue = watch('description') ?? ''

  const { data: breedsData } = useQuery({
    queryKey: ['breeds', selectedSpecies],
    queryFn: () =>
      axiosClient
        .get<{ data: Breed[] }>(`/breeds${selectedSpecies ? `?species=${selectedSpecies}` : ''}`)
        .then((r) => r.data.data),
    enabled: !!selectedSpecies,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateListingPayload) => createListing(data),
    onSuccess: (res) => {
      setListing(res.data.data)
      setStep(2)
    },
  })

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!listing) return

      // Upload listing photos
      for (const file of listingPhotos) {
        await uploadListingPhoto(listing.id, file, 'listing')
      }
      // Upload parent photos
      for (const file of parentPhotos) {
        await uploadListingPhoto(listing.id, file, 'parent')
      }
      // Upload health cert
      if (healthCertFile) {
        await uploadHealthCertificate(listing.id, healthCertFile)
      }
    },
    onSuccess: () => {
      if (listing) {
        navigate(`/listings/${listing.id}`)
      }
    },
  })

  function onStep1Submit(data: Step1Fields) {
    const payload: CreateListingPayload = {
      ...data,
      price: Number(data.price),
      date_of_birth: data.date_of_birth || undefined,
      location: data.location || undefined,
    }
    createMutation.mutate(payload)
  }

  function addListingPhotos(files: FileList | null, type: 'listing' | 'parent') {
    if (!files) return
    const arr = Array.from(files)
    if (type === 'listing') {
      const next = [...listingPhotos, ...arr].slice(0, 10)
      setListingPhotos(next)
    } else {
      setParentPhotos((prev) => [...prev, ...arr])
    }
    setPhotoError(null)
  }

  function removeListingPhoto(idx: number) {
    setListingPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  function removeParentPhoto(idx: number) {
    setParentPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  function canAdvanceToStep3() {
    return listingPhotos.length >= 3 && parentPhotos.length >= 1
  }

  function handleStep2Next() {
    if (!canAdvanceToStep3()) {
      setPhotoError(
        t('listing.form.photo_min_error', 'Upload at least 3 listing photos and 1 parent photo.')
      )
      return
    }
    setStep(3)
  }

  // ─── Step indicators ───────────────────────────────────────────────
  const steps = [
    t('listing.form.step1', 'Details'),
    t('listing.form.step2', 'Photos'),
    t('listing.form.step3', 'Publish'),
  ]

  return (
    <div className="max-w-2xl">
      {/* Step header */}
      <div className="flex items-center gap-3 mb-8">
        {steps.map((label, i) => {
          const num = i + 1
          const active = step === num
          const done = step > num
          return (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {done ? '✓' : num}
              </div>
              <span className={`text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < steps.length - 1 && <span className="text-gray-300 mx-1">→</span>}
            </div>
          )
        })}
      </div>

      {/* ─── Step 1 ── Details ──────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listing.form.species', 'Species')} *
            </label>
            <div className="flex gap-3">
              {(['dog', 'cat', 'other'] as const).map((sp) => (
                <label key={sp} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={sp}
                    {...register('species', {
                      required: t('listing.form.species_required', 'Select a species'),
                    })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm capitalize">
                    {sp === 'dog' ? '🐕 ' : sp === 'cat' ? '🐈 ' : '🐾 '}
                    {t(`common.species.${sp}`, sp)}
                  </span>
                </label>
              ))}
            </div>
            {errors.species && (
              <p className="text-red-600 text-sm mt-1">{errors.species.message}</p>
            )}
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listing.form.breed', 'Breed')} *
            </label>
            {breedsData && breedsData.length > 0 ? (
              <select
                {...register('breed', {
                  required: t('listing.form.breed_required', 'Select a breed'),
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('listing.form.breed_placeholder', 'Select breed…')}</option>
                {breedsData.map((b) => (
                  <option key={b.id} value={b.name_ro}>
                    {b.name_ro}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={t('listing.form.breed_input_placeholder', 'Enter breed name')}
                {...register('breed', {
                  required: t('listing.form.breed_required', 'Select a breed'),
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors.breed && <p className="text-red-600 text-sm mt-1">{errors.breed.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listing.form.title', 'Title')} *
            </label>
            <input
              type="text"
              {...register('title', {
                required: t('listing.form.title_required', 'Title is required'),
                maxLength: {
                  value: 255,
                  message: t('listing.form.title_max', 'Max 255 characters'),
                },
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listing.form.description', 'Description')} *
              <span className="ml-2 text-gray-400 font-normal text-xs">{descValue.length}/500</span>
            </label>
            <textarea
              rows={4}
              {...register('description', {
                required: t('listing.form.description_required', 'Description is required'),
                maxLength: {
                  value: 500,
                  message: t('listing.form.description_max', 'Max 500 characters'),
                },
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Gender + DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listing.form.gender', 'Gender')} *
              </label>
              <div className="flex gap-4">
                {(['male', 'female'] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      value={g}
                      {...register('gender', {
                        required: t('listing.form.gender_required', 'Select gender'),
                      })}
                      className="accent-blue-600"
                    />
                    {t(`common.gender.${g}`, g)}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listing.form.dob', 'Date of Birth')}
              </label>
              <input
                type="date"
                {...register('date_of_birth')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listing.form.price', 'Price')} *
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                {...register('price', {
                  required: t('listing.form.price_required', 'Price is required'),
                  min: { value: 0, message: t('listing.form.price_min', 'Price must be positive') },
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('listing.form.currency', 'Currency')}
              </label>
              <select
                {...register('currency')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="MDL">MDL</option>
                <option value="RON">RON</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listing.form.location', 'Location')}
            </label>
            <input
              type="text"
              placeholder={
                profileData?.location ??
                t('listing.form.location_placeholder', 'Inherited from profile')
              }
              {...register('location')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('listing.form.listing_type', 'Listing Type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['standard', 'featured'] as const).map((lt) => (
                <label
                  key={lt}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors
                    ${selectedListingType === lt ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    value={lt}
                    {...register('listing_type')}
                    className="sr-only"
                  />
                  <p className="font-medium text-sm capitalize">{t(`listing.type.${lt}`, lt)}</p>
                  <p className="text-blue-600 font-bold text-lg">€{LISTING_PRICES[lt]}</p>
                  {lt === 'featured' && (
                    <p className="text-xs text-gray-500">
                      {t('listing.type.featured_description', 'Top placement')}
                    </p>
                  )}
                </label>
              ))}
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-red-600 text-sm">
              {t('listing.form.create_error', 'Failed to save listing. Please try again.')}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors"
          >
            {createMutation.isPending
              ? t('common.saving', 'Saving…')
              : t('listing.form.next_photos', 'Next: Add Photos →')}
          </button>
        </form>
      )}

      {/* ─── Step 2 ── Photos ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Listing photos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {t('listing.form.listing_photos', 'Listing Photos')}
              <span className="ml-1 text-gray-400 font-normal">(min 3, max 10, 5 MB each)</span>
            </h3>
            <input
              ref={listingPhotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addListingPhotos(e.target.files, 'listing')}
            />
            <button
              type="button"
              onClick={() => listingPhotoRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              {t('listing.form.click_to_upload', 'Click to upload photos')}
            </button>
            {listingPhotos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {listingPhotos.map((f, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeListingPhoto(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {listingPhotos.length} / 10 {t('listing.form.photos_uploaded', 'photos')}
            </p>
          </div>

          {/* Parent photos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {t('listing.form.parent_photos', 'Parent Photos')}
              <span className="ml-1 text-gray-400 font-normal">(min 1)</span>
            </h3>
            <input
              ref={parentPhotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addListingPhotos(e.target.files, 'parent')}
            />
            <button
              type="button"
              onClick={() => parentPhotoRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
            >
              {t('listing.form.click_to_upload', 'Click to upload photos')}
            </button>
            {parentPhotos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {parentPhotos.map((f, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeParentPhoto(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {photoError && <p className="text-red-600 text-sm">{photoError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            >
              ← {t('common.back', 'Back')}
            </button>
            <button
              type="button"
              onClick={handleStep2Next}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition-colors"
            >
              {t('listing.form.next_cert', 'Next: Health Certificate →')}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3 ── Health Doc + Publish ─────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Health certificate */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {t('listing.form.health_cert', 'Health Certificate')} *
              <span className="ml-1 text-gray-400 font-normal">(PDF or image, max 10 MB)</span>
            </h3>
            <input
              ref={certRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setHealthCertFile(e.target.files?.[0] ?? null)}
            />
            {healthCertFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700">{healthCertFile.name}</span>
                <button
                  type="button"
                  onClick={() => setHealthCertFile(null)}
                  className="ml-auto text-xs text-red-500 hover:text-red-700"
                >
                  {t('common.remove', 'Remove')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => certRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
              >
                {t('listing.form.upload_cert', 'Upload health certificate')}
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <h3 className="font-semibold text-gray-700">{t('listing.form.summary', 'Summary')}</h3>
            <div className="flex justify-between text-gray-600">
              <span>{t('listing.form.listing_type', 'Listing Type')}</span>
              <span className="capitalize">{listing?.listing_type ?? '—'}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-900">
              <span>{t('listing.form.fee', 'Listing Fee')}</span>
              <span>€{LISTING_PRICES[listing?.listing_type ?? 'standard']}</span>
            </div>
            {listing?.status === 'active' && (
              <p className="text-xs text-green-600 font-medium">
                {t('listing.form.bypass_active', 'Dev mode: listing will be activated for free')}
              </p>
            )}
          </div>

          {publishMutation.isError && (
            <p className="text-red-600 text-sm">
              {t('listing.form.publish_error', 'Failed to publish. Please try again.')}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            >
              ← {t('common.back', 'Back')}
            </button>
            <button
              type="button"
              disabled={!healthCertFile || publishMutation.isPending}
              onClick={() => publishMutation.mutate()}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-md text-sm transition-colors"
            >
              {publishMutation.isPending
                ? t('common.publishing', 'Publishing…')
                : t('listing.form.publish', 'Publish Listing')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
