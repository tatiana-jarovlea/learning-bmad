import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationStatusCard from './VerificationStatusCard'
import type { VerificationStatusResponse } from '@/api/breeders.api'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}))

function makeStatus(
  overrides: Partial<VerificationStatusResponse> = {}
): VerificationStatusResponse {
  return {
    status: 'not_submitted',
    admin_notes: null,
    submitted_at: null,
    reviewed_at: null,
    ...overrides,
  }
}

function renderCard(status: VerificationStatusResponse, onSubmitClick = vi.fn()) {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <VerificationStatusCard status={status} onSubmitClick={onSubmitClick} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('VerificationStatusCard', () => {
  it('renders not_submitted state with submit button', () => {
    renderCard(makeStatus({ status: 'not_submitted' }))

    expect(screen.getByText('verification.status.not_submitted')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('verification.cta_submit')).toBeInTheDocument()
  })

  it('renders pending state with no action button', () => {
    renderCard(makeStatus({ status: 'pending' }))

    expect(screen.getByText('verification.status.pending')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders under_review state with no action button', () => {
    renderCard(makeStatus({ status: 'under_review' }))

    expect(screen.getByText('verification.status.under_review')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders verified state with no action buttons', () => {
    renderCard(makeStatus({ status: 'verified' }))

    expect(screen.getByText('verification.status.verified')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders rejected state with admin notes and resubmit button', () => {
    renderCard(
      makeStatus({
        status: 'rejected',
        admin_notes: 'Certificate expired.',
      })
    )

    expect(screen.getByText('verification.status.rejected')).toBeInTheDocument()
    expect(screen.getByText('Certificate expired.')).toBeInTheDocument()
    expect(screen.getByText('verification.cta_resubmit')).toBeInTheDocument()
  })

  it('submit button calls onSubmitClick', () => {
    const onSubmitClick = vi.fn()
    renderCard(makeStatus({ status: 'not_submitted' }), onSubmitClick)

    fireEvent.click(screen.getByRole('button'))
    expect(onSubmitClick).toHaveBeenCalledTimes(1)
  })

  it('rejected state does not show admin_notes when notes are null', () => {
    renderCard(makeStatus({ status: 'rejected', admin_notes: null }))

    expect(screen.queryByText('verification.admin_notes_label')).not.toBeInTheDocument()
    // resubmit button still shown
    expect(screen.getByText('verification.cta_resubmit')).toBeInTheDocument()
  })
})
