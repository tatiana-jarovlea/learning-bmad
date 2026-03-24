import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { UserMenu } from './UserMenu'

const mockNavigate = vi.fn()
const mockLogout = vi.fn().mockResolvedValue(undefined)

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (s: { user: { name: string; role: string } | null }) => unknown) =>
    selector({ user: { name: 'Ion Popescu', role: 'buyer' } }),
}))

// Provide getState as a property on useAuthStore mock
import * as authStoreModule from '@/store/authStore'
Object.assign(authStoreModule.useAuthStore, {
  getState: () => ({ logout: mockLogout }),
})

function renderMenu() {
  return render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>
  )
}

describe('UserMenu', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders user name as dropdown trigger', () => {
    renderMenu()
    expect(screen.getByText('Ion Popescu')).toBeInTheDocument()
  })

  it('opens dropdown on click and shows menu items', () => {
    renderMenu()
    fireEvent.click(screen.getByText('Ion Popescu'))
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('calls logout and navigates to / on logout click', async () => {
    renderMenu()
    fireEvent.click(screen.getByText('Ion Popescu'))
    fireEvent.click(screen.getByText('Log out'))
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
