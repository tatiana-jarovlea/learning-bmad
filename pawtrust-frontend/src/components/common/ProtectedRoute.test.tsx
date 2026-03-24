import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from './ProtectedRoute'

// Mock authStore — each test overrides via vi.mocked pattern
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/store/authStore'

const mockUseAuthStore = vi.mocked(useAuthStore)

function setupStore(token: string | null, role: string | null) {
  mockUseAuthStore.mockImplementation(
    (selector: (s: { token: string | null; user: { role: string } | null }) => unknown) =>
      selector({
        token,
        user: role ? { role } : null,
      })
  )
}

function renderProtected(path: string, token: string | null, role: string | null) {
  setupStore(token, role)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/buyer/dashboard" element={<div>Buyer Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function renderAdmin(path: string, token: string | null, role: string | null) {
  setupStore(token, role)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects unauthenticated user to /login', () => {
    renderProtected('/buyer/dashboard', null, null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children for authenticated user', () => {
    renderProtected('/buyer/dashboard', 'tok123', 'buyer')
    expect(screen.getByText('Buyer Dashboard')).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects unauthenticated user to /login', () => {
    renderAdmin('/admin', null, null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects authenticated non-admin to /', () => {
    renderAdmin('/admin', 'tok123', 'buyer')
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('renders admin dashboard for admin user', () => {
    renderAdmin('/admin', 'tok123', 'admin')
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })
})
