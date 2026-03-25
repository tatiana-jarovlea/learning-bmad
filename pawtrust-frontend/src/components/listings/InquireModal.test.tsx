import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InquireModal } from './InquireModal'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}))

const mockSubmitInquiry = vi.fn()

vi.mock('@/api/inquiry.api', () => ({
  submitInquiry: (...args: unknown[]) => mockSubmitInquiry(...args),
}))

// TanStack Query wrapper
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const defaultProps = {
  listingId: 1,
  listingTitle: 'Golden Retriever Puppy',
  onSuccess: vi.fn(),
}

describe('InquireModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea and submit button', () => {
    render(<InquireModal {...defaultProps} />, { wrapper })

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
  })

  it('character counter decrements correctly', () => {
    render(<InquireModal {...defaultProps} />, { wrapper })

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello' } })

    expect(screen.getByText(/495/)).toBeInTheDocument()
  })

  it('submit calls submitInquiry with correct listingId and message', async () => {
    const resolvedContact = { name: 'Ion', email: 'ion@example.com', phone: '+373123' }
    mockSubmitInquiry.mockResolvedValueOnce({
      data: {
        data: { inquiry_id: 1, status: 'contact_revealed', breeder_contact: resolvedContact },
      },
    })

    render(<InquireModal {...defaultProps} />, { wrapper })

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'I am interested' } })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(mockSubmitInquiry).toHaveBeenCalledWith(1, 'I am interested')
    })
  })

  it('on success shows ContactRevealCard with returned contact data', async () => {
    const resolvedContact = { name: 'Ion Popescu', email: 'ion@test.com', phone: '+37369000000' }
    mockSubmitInquiry.mockResolvedValueOnce({
      data: {
        data: { inquiry_id: 2, status: 'contact_revealed', breeder_contact: resolvedContact },
      },
    })

    render(<InquireModal {...defaultProps} />, { wrapper })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(screen.getByText('Ion Popescu')).toBeInTheDocument()
      expect(screen.getByText('ion@test.com')).toBeInTheDocument()
    })
  })

  it('on 409 shows already inquired info banner not generic error', async () => {
    mockSubmitInquiry.mockRejectedValueOnce({ response: { status: 409 } })

    render(<InquireModal {...defaultProps} />, { wrapper })

    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/You have already inquired about this listing/)).toBeInTheDocument()
    })

    // Generic error should NOT appear
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
