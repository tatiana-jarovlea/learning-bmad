import axiosClient from './axiosClient'
import type { User } from '@/types/user'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'buyer' | 'breeder' | 'sitter'
}

export interface LoginPayload {
  email: string
  password: string
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

export const loginUser = (payload: LoginPayload) =>
  axiosClient.post<AuthResponse>('/auth/login', payload)

export const logoutUser = () => axiosClient.post('/auth/logout')

export const getMe = () => axiosClient.get<{ data: User }>('/auth/me')
