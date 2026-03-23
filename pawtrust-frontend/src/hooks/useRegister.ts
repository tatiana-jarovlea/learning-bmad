import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { registerUser, type RegisterPayload } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const ROLE_DASHBOARDS: Record<string, string> = {
  buyer: '/dashboard',
  breeder: '/breeder/dashboard',
  sitter: '/sitter/dashboard',
  admin: '/admin',
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: ({ data }) => {
      const { token, user } = data.data
      setAuth(token, user)
      navigate(ROLE_DASHBOARDS[user.role] ?? '/dashboard')
    },
  })
}
