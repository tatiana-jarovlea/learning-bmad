import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationQueue from './VerificationQueue'
import * as adminApi from '@/api/admin.api'
import type { AdminVerificationRequest } from '@/api/admin.api'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}))

vi.mock('@/api/admin.api', () => ({
  getVerificationRequests: vi.fn(),
  reviewVerificationRequest: vi.fn(),
  getDocumentPreviewUrl: vi.fn(),
}))

const mockRequest: AdminVerificationRequest = {
  id: 1,
  status: 'pending',
  admin_notes: null,
  submitted_at: '2026-03-01T10:00:00Z',
  reviewed_at: null,
  reviewed_by: null,
  breeder: {
    id: 10,
    name: 'Ion Popescu',
    kennel_name: 'Golden Stars',
    email: 'ion@example.com',
  },
  documents: [{ id: 5, document_type: 'kennel_cert', filename: 'cert.pdf', status: 'pending' }],
}

function makePagedResponse(items: AdminVerificationRequest[]) {
  return Promise.resolve({
    data: {
      data: items,
      meta: { current_page: 1, last_page: 1, per_page: 20, total: items.length },
    },
  })
}

function renderQueue() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <VerificationQueue />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('VerificationQueue', () => {
  beforeEach(() => {
    vi.mocked(adminApi.getVerificationRequests).mockReturnValue(
      makePagedResponse([mockRequest]) as any
    )
  })

  it('renders table with pending requests from mock API', async () => {
    renderQueue()

    await waitFor(() => {
      expect(screen.getByText('Ion Popescu')).toBeInTheDocument()
    })

    expect(screen.getByText('Golden Stars')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('filter tabs update query param and re-fetch', async () => {
    renderQueue()

    await waitFor(() => screen.getByText('Ion Popescu'))

    const approvedTab = screen.getByText('Approved')
    fireEvent.click(approvedTab)

    await waitFor(() => {
      expect(adminApi.getVerificationRequests).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      )
    })
  })

  it('"Review" button opens modal for the correct request', async () => {
    renderQueue()

    await waitFor(() => screen.getByText('Ion Popescu'))

    const reviewBtn = screen.getByText(/Review/)
    fireEvent.click(reviewBtn)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('ion@example.com')).toBeInTheDocument()
    })
  })

  it('after review, modal closes and table refreshes', async () => {
    vi.mocked(adminApi.reviewVerificationRequest).mockResolvedValue({
      data: { data: { ...mockRequest, status: 'approved' } },
    } as any)

    renderQueue()

    await waitFor(() => screen.getByText('Ion Popescu'))

    fireEvent.click(screen.getByText(/Review/))
    await waitFor(() => screen.getByRole('dialog'))

    // Select "Approve" radio
    fireEvent.click(screen.getByDisplayValue('approved'))

    // Submit
    fireEvent.click(screen.getByText('Save Decision'))

    await waitFor(() => {
      expect(adminApi.reviewVerificationRequest).toHaveBeenCalledWith(1, {
        status: 'approved',
        notes: undefined,
      })
    })
  })
})
