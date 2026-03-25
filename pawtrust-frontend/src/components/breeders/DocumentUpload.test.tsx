import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DocumentUpload } from './DocumentUpload'
import * as breedersApi from '@/api/breeders.api'
import type { BreederDocument } from '@/api/breeders.api'

vi.mock('@/api/breeders.api')

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback ?? _key,
  }),
}))

function makeDoc(overrides: Partial<BreederDocument> = {}): BreederDocument {
  return {
    id: 1,
    document_type: 'kennel_cert',
    filename: 'cert.pdf',
    uploaded_at: new Date().toISOString(),
    status: 'pending',
    ...overrides,
  }
}

function makeAxiosResponse<T>(data: T) {
  return {
    data: { data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  }
}

function renderComponent(onUploaded = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <DocumentUpload breederId={42} onUploaded={onUploaded} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DocumentUpload', () => {
  it('renders document type dropdown and file input', () => {
    renderComponent()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  it('shows error when file exceeds 10 MB', () => {
    renderComponent()

    const bigFile = new File(['x'.repeat(1)], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [bigFile] } })

    expect(screen.getByText(/file exceeds 10 mb limit/i)).toBeInTheDocument()
  })

  it('calls onUploaded with the response document on success', async () => {
    const doc = makeDoc()
    vi.mocked(breedersApi.uploadBreederDocument).mockResolvedValue(makeAxiosResponse(doc))

    const onUploaded = vi.fn()
    renderComponent(onUploaded)

    const validFile = new File(['%PDF-1.4 stub'], 'cert.pdf', { type: 'application/pdf' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    fireEvent.click(screen.getByRole('button', { name: /upload/i }))

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(doc))
    expect(breedersApi.uploadBreederDocument).toHaveBeenCalledWith(42, validFile, 'kennel_cert')
  })

  it('shows API error message on failed upload', async () => {
    vi.mocked(breedersApi.uploadBreederDocument).mockRejectedValue({
      response: { data: { message: 'Invalid file type.' } },
    })

    renderComponent()

    const validFile = new File(['%PDF-1.4 stub'], 'bad.pdf', { type: 'application/pdf' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    fireEvent.click(screen.getByRole('button', { name: /upload/i }))

    await waitFor(() => expect(screen.getByText(/invalid file type/i)).toBeInTheDocument())
  })
})
