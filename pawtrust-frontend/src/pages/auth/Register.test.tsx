import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RegisterPage from './Register'
import * as authApi from '@/api/auth.api'

vi.mock('@/api/auth.api')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { setAuth: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ setAuth: vi.fn() }),
}))

function renderWithProviders(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders all form fields and role selector cards', () => {
    renderWithProviders(<RegisterPage />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buyer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /breeder/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sitter/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<RegisterPage />)
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('shows password mismatch error', async () => {
    renderWithProviders(<RegisterPage />)
    fireEvent.input(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different999' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('calls registerUser with correct payload on valid submit', async () => {
    const mockRegister = vi.spyOn(authApi, 'registerUser').mockResolvedValue({
      data: {
        data: {
          token: 'tok',
          user: { id: 1, name: 'Ion', email: 'i@e.com', role: 'buyer', locale: 'ro' },
        },
        message: 'ok',
      },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as never,
    })

    renderWithProviders(<RegisterPage />)

    fireEvent.input(screen.getByLabelText(/full name/i), { target: { value: 'Ion Popescu' } })
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@example.com' } })
    fireEvent.input(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.input(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /buyer/i }))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'ion@example.com', role: 'buyer' })
      )
    })
  })
})
