import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import LoginPage from './Login'
import * as authApi from '@/api/auth.api'

vi.mock('@/api/auth.api')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockSetAuth = vi.fn()
vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { setAuth: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}))

function renderPage(search = '') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/login${search}`]}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function makeSuccessResponse(role: string) {
  return {
    data: {
      data: {
        token: 'tok123',
        user: { id: 1, name: 'Ion', email: 'ion@e.com', role, locale: 'ro' },
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email, password inputs and submit button', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows generic error message on 401 response', async () => {
    vi.spyOn(authApi, 'loginUser').mockRejectedValue(
      Object.assign(new axios.AxiosError('Unauthorized'), { response: { status: 401 } })
    )
    renderPage()
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@e.com' } })
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email or password is incorrect/i)).toBeInTheDocument()
    })
  })

  it('shows rate limit message on 429 response', async () => {
    vi.spyOn(authApi, 'loginUser').mockRejectedValue(
      Object.assign(new axios.AxiosError('Too Many Requests'), { response: { status: 429 } })
    )
    renderPage()
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@e.com' } })
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
    })
  })

  it('calls loginUser with correct email and password', async () => {
    const spy = vi.spyOn(authApi, 'loginUser').mockResolvedValue(makeSuccessResponse('buyer'))
    renderPage()
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@e.com' } })
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({ email: 'ion@e.com', password: 'password123' })
    })
  })

  it('redirects buyer to /buyer/dashboard after login', async () => {
    vi.spyOn(authApi, 'loginUser').mockResolvedValue(makeSuccessResponse('buyer'))
    renderPage()
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@e.com' } })
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/buyer/dashboard')
    })
  })

  it('redirects breeder to /breeder/dashboard after login', async () => {
    vi.spyOn(authApi, 'loginUser').mockResolvedValue(makeSuccessResponse('breeder'))
    renderPage()
    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'ion@e.com' } })
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/breeder/dashboard')
    })
  })
})
