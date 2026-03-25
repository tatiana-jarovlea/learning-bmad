import axiosClient from './axiosClient'

export interface BreederContact {
  name: string
  email: string
  phone: string | null
}

export interface InquiryResponse {
  inquiry_id: number
  status: string
  breeder_contact: BreederContact
}

export const submitInquiry = (listingId: number, message?: string) =>
  axiosClient.post<{ data: InquiryResponse }>(`/listings/${listingId}/inquire`, {
    message: message ?? null,
  })
