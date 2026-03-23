import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  token: string | null
  user: User | null
  locale: 'ro' | 'ru'
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  setLocale: (locale: 'ro' | 'ru') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      locale: 'ro',
      setAuth: (token, user) => set({ token, user, locale: user.locale }),
      clearAuth: () => set({ token: null, user: null }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'pawtrust-auth',
    }
  )
)

