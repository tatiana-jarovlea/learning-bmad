import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { loginUser, type LoginPayload } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const ROLE_DASHBOARDS: Record<string, string> = {
  buyer: '/buyer/dashboard',
  breeder: '/breeder/dashboard',
  sitter: '/sitter/dashboard',
  admin: '/admin',
}

type FormValues = {
  email: string
  password: string
}

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: ({ data }) => {
      const { token, user } = data.data
      setAuth(token, user)

      // Open redirect guard: only follow safe relative redirects
      const redirect = searchParams.get('redirect') ?? ''
      const isSafe = redirect.startsWith('/') && !redirect.startsWith('//')
      navigate(isSafe ? redirect : (ROLE_DASHBOARDS[user.role] ?? '/'))
    },
  })

  const apiStatus =
    error && 'response' in (error as object)
      ? (error as { response?: { status?: number } }).response?.status
      : null

  const onSubmit = (data: FormValues) => login(data)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">PawTrust</h1>
          <h2 className="mt-2 text-xl text-gray-600">
            {t('auth.login_title', 'Sign in to your account')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* API error messages */}
          {apiStatus === 401 && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {t('auth.invalid_credentials', 'Email or password is incorrect.')}
            </div>
          )}
          {apiStatus === 429 && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
              {t('auth.rate_limited', 'Too many login attempts. Please wait a minute.')}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              {t('auth.email', 'Email address')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('email', {
                required: t('auth.email_required', 'Email is required'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('auth.email_invalid', 'Invalid email address'),
                },
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              {t('auth.password', 'Password')}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('password', {
                  required: t('auth.password_required', 'Password is required'),
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {t('auth.forgot_password', 'Forgot password?')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t('auth.signing_in', 'Signing in…') : t('auth.login', 'Sign in')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          {t('auth.no_account', "Don't have an account?")}{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            {t('auth.register', 'Register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
