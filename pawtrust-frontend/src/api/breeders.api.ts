import axiosClient from './axiosClient'

export interface ListingSummary {
  id: number
  title: string | null
}

export interface BreederProfile {
  id: number
  kennel_name: string | null
  display_name: string | null
  description: string | null
  location: string | null
  website: string | null
  breed_specialization: string[] | null
  profile_photo_url: string | null
  years_active: number | null
  verified: boolean
  verified_at: string | null
  listings: ListingSummary[]
}

export interface BreederProfilePrivate extends BreederProfile {
  phone: string | null
  user_id: number
}

export interface BreederProfilePayload {
  kennel_name?: string
  display_name?: string
  description?: string
  location?: string
  phone?: string
  website?: string
  breed_specialization?: string[]
  years_active?: number
}

export const createBreederProfile = (payload: BreederProfilePayload) =>
  axiosClient.post<{ data: BreederProfilePrivate }>('/breeder/profile', payload)

export const updateBreederProfile = (payload: BreederProfilePayload) =>
  axiosClient.put<{ data: BreederProfilePrivate }>('/breeder/profile', payload)

export const getMyBreederProfile = () =>
  axiosClient.get<{ data: BreederProfilePrivate }>('/breeder/profile')

export const getPublicBreederProfile = (id: number) =>
  axiosClient.get<{ data: BreederProfile }>(`/breeders/${id}`)

export const uploadBreederProfilePhoto = (file: File) => {
  const form = new FormData()
  form.append('profile_photo', file)
  return axiosClient.post<{ data: BreederProfilePrivate }>('/breeder/profile/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
