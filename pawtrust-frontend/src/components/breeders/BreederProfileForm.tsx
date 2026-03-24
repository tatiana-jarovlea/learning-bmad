import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  createBreederProfile,
  updateBreederProfile,
  getMyBreederProfile,
  uploadBreederProfilePhoto,
  type BreederProfilePayload,
} from '@/api/breeders.api'

const MOLDOVA_CITIES = [
  'Chișinău, Moldova',
  'Bălți, Moldova',
  'Cahul, Moldova',
  'Ungheni, Moldova',
  'Soroca, Moldova',
  'Orhei, Moldova',
  'Comrat, Moldova',
  'Strășeni, Moldova',
]

const ROMANIA_CITIES = [
  'București, România',
  'Cluj-Napoca, România',
  'Timișoara, România',
  'Iași, România',
  'Constanța, România',
  'Brașov, România',
]

const ALL_CITIES = [...MOLDOVA_CITIES, ...ROMANIA_CITIES]

type FormValues = BreederProfilePayload & { profile_photo?: FileList }

interface Props {
  onSuccess?: () => void
}

export function BreederProfileForm({ onSuccess }: Props) {
  const { t } = useTranslation()
  const [charCount, setCharCount] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const { data: existingProfileData } = useQuery({
    queryKey: ['myBreederProfile'],
    queryFn: () => getMyBreederProfile().then((r) => r.data.data),
    retry: false,
  })

  const profile = existingProfileData
  const isUpdate = !!profile?.kennel_name

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: profile ?? {},
  })

  const {
    mutate: saveProfile,
    isPending,
    error: saveError,
  } = useMutation({
    mutationFn: async (data: FormValues) => {
      const { profile_photo, ...payload } = data
      const saved = isUpdate
        ? await updateBreederProfile(payload)
        : await createBreederProfile(payload)

      // Upload photo as a separate step if provided
      const files = profile_photo
      if (files && files.length > 0) {
        await uploadBreederProfilePhoto(files[0])
      }

      return saved
    },
    onSuccess: () => onSuccess?.(),
  })

  const descriptionValue = watch('description') ?? ''

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={handleSubmit((data) => saveProfile(data))} className="space-y-5">
      {saveError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {t('common.error', 'An error occurred. Please try again.')}
        </div>
      )}

      {/* Kennel Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.kennel_name', 'Kennel Name')}
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('kennel_name', { maxLength: 255 })}
        />
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.display_name', 'Display Name')}
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('display_name', { maxLength: 255 })}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.description', 'Description')}
        </label>
        <textarea
          rows={4}
          maxLength={1000}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('description', {
            maxLength: 1000,
            onChange: (e) => setCharCount(e.target.value.length),
          })}
        />
        <p className="mt-1 text-xs text-gray-400 text-right">{descriptionValue.length}/1000</p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.location', 'Location')}
        </label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('location')}
        >
          <option value="">{t('breeder.profile.select_city', '— Select city —')}</option>
          <optgroup label="Moldova">
            {MOLDOVA_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="România">
            {ROMANIA_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.website', 'Website')}
        </label>
        <input
          type="url"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('website')}
        />
      </div>

      {/* Years Active */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.years_active', 'Years Active')}
        </label>
        <input
          type="number"
          min={0}
          max={100}
          className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          {...register('years_active', { valueAsNumber: true, min: 0, max: 100 })}
        />
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('breeder.profile.photo', 'Profile Photo')}
        </label>
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Preview"
            className="mt-2 w-24 h-24 rounded-full object-cover"
          />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block text-sm text-gray-500"
          {...register('profile_photo', { onChange: handlePhotoChange })}
        />
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 MB</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending
          ? t('common.saving', 'Saving…')
          : isUpdate
            ? t('breeder.profile.update', 'Update Profile')
            : t('breeder.profile.create', 'Create Profile')}
      </button>
    </form>
  )
}
