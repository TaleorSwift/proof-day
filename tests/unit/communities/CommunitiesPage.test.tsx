// @vitest-environment jsdom
/**
 * Tests — CommunitiesPage (Story 9.10)
 * Verifica el redirect condicional y el estado vacío según número de comunidades.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { redirectMock, permanentRedirectMock, getUserCommunitiesMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  permanentRedirectMock: vi.fn(),
  getUserCommunitiesMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
  permanentRedirect: permanentRedirectMock,
}))

vi.mock('@/lib/queries/communities', () => ({
  getUserCommunities: getUserCommunitiesMock,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-test-123' } },
        error: null,
      }),
    },
  }),
}))

vi.mock('@/components/communities/CommunityList', () => ({
  CommunityList: ({ communities }: { communities: unknown[] }) => (
    <ul data-testid="community-list">
      {communities.map((_, i) => (
        <li key={i} data-testid="community-item" />
      ))}
    </ul>
  ),
}))

vi.mock('@/components/communities/EmptyCommunitiesState', () => ({
  EmptyCommunitiesState: () => (
    <div data-testid="communities-empty-state">
      <p>Aún no perteneces a ninguna comunidad</p>
      <span data-testid="btn-create-community">Crear comunidad</span>
    </div>
  ),
}))

import CommunitiesPage from '@/app/(app)/communities/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCommunity = (slug: string) => ({
  id: `id-${slug}`,
  name: `Comunidad ${slug}`,
  slug,
  description: '',
  image_url: null,
  created_by: 'user-test-123',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  member_count: 1,
})

const defaultSearchParams = Promise.resolve({})

// ---------------------------------------------------------------------------
// AC-1: 1 comunidad → redirect
// ---------------------------------------------------------------------------

describe('CommunitiesPage — AC-1: redirect con 1 comunidad', () => {
  beforeEach(() => {
    getUserCommunitiesMock.mockResolvedValue([makeCommunity('mi-comunidad')])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a permanentRedirect con la ruta de la comunidad única', async () => {
    await CommunitiesPage({ searchParams: defaultSearchParams })
    expect(permanentRedirectMock).toHaveBeenCalledWith('/communities/mi-comunidad')
  })

  it('llama a permanentRedirect exactamente una vez', async () => {
    await CommunitiesPage({ searchParams: defaultSearchParams })
    expect(permanentRedirectMock).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-2: 0 comunidades → estado vacío
// ---------------------------------------------------------------------------

describe('CommunitiesPage — AC-2: empty state con 0 comunidades', () => {
  beforeEach(() => {
    getUserCommunitiesMock.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('NO llama a redirect', async () => {
    await CommunitiesPage({ searchParams: defaultSearchParams })
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('renderiza el estado vacío', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('communities-empty-state')).toBeInTheDocument()
  })

  it('NO renderiza la lista de comunidades', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('community-list')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-3: 2+ comunidades → lista sin cambios
// ---------------------------------------------------------------------------

describe('CommunitiesPage — AC-3: lista con 2+ comunidades', () => {
  beforeEach(() => {
    getUserCommunitiesMock.mockResolvedValue([
      makeCommunity('alpha'),
      makeCommunity('beta'),
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('NO llama a redirect', async () => {
    await CommunitiesPage({ searchParams: defaultSearchParams })
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('renderiza la lista de comunidades', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('community-list')).toBeInTheDocument()
  })

  it('NO renderiza el estado vacío', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('communities-empty-state')).not.toBeInTheDocument()
  })

  it('muestra todos los items de la lista', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.getAllByTestId('community-item')).toHaveLength(2)
  })

  it('muestra el botón "+ Nueva comunidad" con href correcto', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    const btn = screen.getByTestId('btn-new-community')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/communities/new')
  })
})

// ---------------------------------------------------------------------------
// AC-4: botón nueva comunidad — no visible con 0 comunidades
// ---------------------------------------------------------------------------

describe('CommunitiesPage — AC-4: botón nueva comunidad ausente en empty state', () => {
  beforeEach(() => {
    getUserCommunitiesMock.mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('NO muestra el botón "+ Nueva comunidad" cuando no hay comunidades', async () => {
    const jsx = await CommunitiesPage({ searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('btn-new-community')).not.toBeInTheDocument()
  })
})
