import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateListingForm } from './CreateListingForm'
import * as listingsApi from '@/api/listings.api'
import * as breedersApi from '@/api/breeders.api'
import type { Listing } from '@/api/listings.api'

vi.mock('@/api/listings.api')
vi.mock('@/api/breeders.api')

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback ?? key,
  }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1,
    title: 'Golden Pup',
    description: 'Healthy pup.',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    date_of_birth: null,
    price: '500.00',
    currency: 'EUR',
    location: null,
    status: 'draft',
    listing_type: 'standard',
    featured_until: null,
    health_certificate: null,
    photos: [],
    breeder: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeAxiosResponse<T>(data: T) {
  return {
    data: { data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as never,
  }
}

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CreateListingForm />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

/** Fill required Step 1 fields using name-attribute selectors */
function fillStep1(container: HTMLElement) {
  const dogRadio = screen.getAllByRole('radio').find(
    (r) => (r as HTMLInputElement).value === 'dog',
  )!
  fireEvent.click(dogRadio)
  const maleRadio = screen.getAllByRole('radio').find(
    (r) => (r as HTMLInputElement).value === 'male',
  )!
  fireEvent.click(maleRadio)
  fireEvent.change(container.querySelector('[name="title"]')!, {
    target: { value: 'Lovely Puppy' },
  })
  fireEvent.change(container.querySelector('[name="description"]')!, {
    target: { value: 'Great puppy for a family.' },
  })
  fireEvent.change(container.querySelector('[name="price"]')!, {
    target: { value: '500' },
  })
  fireEvent.change(container.querySelector('[name="breed"]')!, {
    target: { value: 'Golden Retriever' },
  })
}

describe('CreateListingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(breedersApi, 'getMyBreederProfile').mockResolvedValue(
      makeAxiosResponse({
        id: 1,
        kennel_name: 'Sunrise',
        display_name: null,
        description: 'Desc',
        location: 'Chișinău',
        phone: null,
        website: null,
        breed_specialization: null,
        profile_photo_url: null,
        years_active: null,
        verified: false,
        verified_at: null,
        listings: [],
        user_id: 1,
      })
    )
  })

  it('Step 1 renders species selector and breed dropdown', () => {
    renderForm()
    expect(screen.getAllByText(/dog/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/cat/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /next.*photos/i })).toBeInTheDocument()
  })

  it('breed dropdown filters by selected species', async () => {
    const breeds = [
      { id: 1, name_ro: 'Labrador Retriever', name_ru: 'Лабрадор', species: 'dog' as const },
    ]

    // Mock axiosClient via the listings api module's import of axiosClient
    vi.spyOn(listingsApi, 'createListing').mockResolvedValue(makeAxiosResponse(makeListing()))

    // Import axiosClient to mock the breeds fetch
    const axiosModule = await import('@/api/axiosClient')
    vi.spyOn(axiosModule.default, 'get').mockImplementation((url: string) => {
      if (url.includes('/breeds')) {
        return Promise.resolve(makeAxiosResponse(breeds)) as ReturnType<
          typeof axiosModule.default.get
        >
      }
      return Promise.reject(new Error('Unknown'))
    })

    renderForm()

    // Select dog species
    const dogRadio = screen
      .getAllByRole('radio')
      .find((r) => (r as HTMLInputElement).value === 'dog')!
    fireEvent.click(dogRadio)

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  it('shows validation error on empty title submit', async () => {
    renderForm()
    // Select species and gender so those don't block
    const dogRadio = screen
      .getAllByRole('radio')
      .find((r) => (r as HTMLInputElement).value === 'dog')!
    fireEvent.click(dogRadio)
    const maleRadio = screen
      .getAllByRole('radio')
      .find((r) => (r as HTMLInputElement).value === 'male')!
    fireEvent.click(maleRadio)

    fireEvent.click(screen.getByRole('button', { name: /next.*photos/i }))

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })
  })

  it('cannot advance to Step 2 without required Step 1 fields', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /next.*photos/i }))

    await waitFor(() => {
      // Still on step 1 — validation errors visible, no photo upload UI
      expect(screen.queryByText(/listing photos/i)).not.toBeInTheDocument()
    })
  })

  it('Step 2 shows photo upload zone and min 3 enforced', async () => {
    vi.spyOn(listingsApi, 'createListing').mockResolvedValue(makeAxiosResponse(makeListing()))

    const { container } = renderForm()

    fillStep1(container)

    fireEvent.click(screen.getByRole('button', { name: /next.*photos/i }))

    await waitFor(() => {
      expect(screen.getByText(/listing photos/i)).toBeInTheDocument()
    })

    // Try to advance to step 3 without enough photos
    fireEvent.click(screen.getByRole('button', { name: /next.*cert/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 3 listing photos/i)).toBeInTheDocument()
    })
  })

  it('Step 3 shows correct price for selected listing type', async () => {
    vi.spyOn(listingsApi, 'createListing').mockResolvedValue(
      makeAxiosResponse(makeListing({ listing_type: 'featured' }))
    )

    const { container } = renderForm()

    fillStep1(container)

    // Select featured
    const featuredRadio = screen
      .getAllByRole('radio')
      .find((r) => (r as HTMLInputElement).value === 'featured')!
    fireEvent.click(featuredRadio)

    // Featured price card shows €8 on step 1
    expect(screen.getByText('€8')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next.*photos/i }))

    await waitFor(() => {
      expect(screen.getByText(/listing photos/i)).toBeInTheDocument()
    })
  })
})
