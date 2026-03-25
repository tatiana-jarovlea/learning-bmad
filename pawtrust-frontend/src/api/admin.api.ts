import axiosClient from './axiosClient'

export type VerificationReviewStatus = 'under_review' | 'approved' | 'rejected'

export interface AdminVerificationRequest {
  id: number
  status: string
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: number | null
  breeder: {
    id: number
    name: string
    kennel_name: string | null
    email: string
  }
  documents: {
    id: number
    document_type: string
    filename: string
    status: string
  }[]
}

export interface ReviewPayload {
  status: VerificationReviewStatus
  notes?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const getVerificationRequests = (params?: { status?: string; page?: number }) =>
  axiosClient.get<{ data: AdminVerificationRequest[]; meta: PaginationMeta }>(
    '/admin/verification-requests',
    { params }
  )

export const reviewVerificationRequest = (id: number, payload: ReviewPayload) =>
  axiosClient.put<{ data: AdminVerificationRequest }>(
    `/admin/verification-requests/${id}/review`,
    payload
  )

export const getDocumentPreviewUrl = (docId: number) =>
  axiosClient.get<{ data: { url: string; expires_at: string } }>(
    `/admin/documents/${docId}/preview`
  )
