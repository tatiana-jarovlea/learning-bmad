import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VerifiedBadge } from './VerifiedBadge'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}))

describe('VerifiedBadge', () => {
  it('renders green "Verified" badge when verified=true', () => {
    render(<VerifiedBadge verified={true} />)

    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Verified')
    expect(badge.className).toContain('bg-green-100')
    expect(badge.className).toContain('text-green-800')
  })

  it('renders grey "Unverified" badge when verified=false', () => {
    render(<VerifiedBadge verified={false} />)

    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Unverified')
    expect(badge.className).toContain('bg-gray-100')
    expect(badge.className).toContain('text-gray-500')
  })

  it('renders sm size without overflow', () => {
    render(<VerifiedBadge verified={true} size="sm" />)
    const badge = screen.getByRole('status')
    expect(badge.className).toContain('text-xs')
  })

  it('renders md size without overflow', () => {
    render(<VerifiedBadge verified={true} size="md" />)
    const badge = screen.getByRole('status')
    expect(badge.className).toContain('text-sm')
  })

  it('verified badge has tooltip and aria-label', () => {
    render(<VerifiedBadge verified={true} />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('title')
    expect(badge).toHaveAttribute('aria-label')
    expect(badge.getAttribute('title')).toBe('This breeder has been verified by PawTrust')
  })

  it('unverified badge has tooltip and aria-label', () => {
    render(<VerifiedBadge verified={false} />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('title')
    expect(badge).toHaveAttribute('aria-label')
    expect(badge.getAttribute('title')).toBe('This breeder has not yet been verified')
  })
})
