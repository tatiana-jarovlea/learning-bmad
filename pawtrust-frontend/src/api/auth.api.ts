import axiosClient from './axiosClient'
import type { User } from '@/types/user'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'buyer' | 'breeder' | 'sitter'
}

export interface AuthResponse {
  data: {
    token: string
    user: User
  }
  message: string
}

export const registerUser = (payload: RegisterPayload) =>
  axiosClient.post<AuthResponse>('/auth/register', payload)
