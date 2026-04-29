// @vitest-environment jsdom
/**
 * Tests — CommunityPage ([slug]/page.tsx)
 * Verifica los redirects condicionales y el happy path del Server Component.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const {
  mockRedirect,
  mockNotFound,
  mockPermanentRedirect,
  createClientMock,
} = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
  mockPermanentRedirect: vi.fn(),
  createClientMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
  permanentRedirect: mockPermanentRedirect,
  notFound: mockNotFound,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/components/communities/CommunityFeedHeader', () => ({
  CommunityFeedHeader: () => <div data-testid="feed-header" />,
}))

vi.mock('@/components/communities/CommunityHeader', () => ({
  CommunityHeader: () => <div data-testid="community-header" />,
}))

vi.mock('@/components/projects/ProjectFeed', () => ({
  ProjectFeed: () => <div data-testid="project-feed" />,
}))

vi.mock('@/components/gamification/TopContributors', () => ({
  TopContributors: () => <div data-testid="top-contributors" />,
}))

vi.mock('@/components/shared/BackButton', () => ({
  BackButton: ({ href, label }: { href: string; label: string }) => (
    <a href={href} data-testid="back-button">
      {label}
    </a>
  ),
}))

import CommunityPage from '@/app/(app)/communities/[slug]/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Genera un builder de cadena fluente de Supabase que puede encadenarse
 * infinitamente y resuelve al final con el valor dado.
 */
function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'in', 'order', 'single']
  for (const method of methods) {
    if (method === 'single' || method === 'order' || method === 'in') {
      chain[method] = vi.fn().mockResolvedValue(resolvedValue)
    } else {
      chain[method] = vi.fn().mockReturnValue(chain)
    }
  }
  return chain
}

const defaultCommunity = {
  id: 'comm-001',
  name: 'Startup Madrid',
  slug: 'startup-madrid',
  description: 'Comunidad de prueba',
  image_url: null,
  created_by: 'user-123',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const makeSupabaseMock = (overrides: {
  user?: object | null
  authError?: object | null
  community?: object | null
  membership?: object | null
  memberCount?: number
  projects?: object[]
  feedbacks?: object[]
  profiles?: object[]
} = {}) => {
  const {
    user = { id: 'user-123' },
    authError = null,
    community = defaultCommunity,
    membership = { role: 'member' },
    memberCount = 5,
    projects = [],
    feedbacks = [],
    profiles = [],
  } = overrides

  // Rastreamos llamadas a community_members para distinguir count vs rol
  let communityMemberCallCount = 0

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'communities') {
      return makeChain({ data: community, error: null })
    }

    if (table === 'community_members') {
      communityMemberCallCount++
      const call = communityMemberCallCount

      if (call === 1) {
        // Primera llamada: count con { count: 'exact', head: true }
        // La cadena es: .select('*', { count: 'exact', head: true }).eq(...)
        // Resuelve como thenable cuando se awaita la cadena completa.
        const resolved = Promise.resolve({ count: memberCount, data: null, error: null })
        const countChain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          // thenable — Promise.all awaita este objeto
          then: resolved.then.bind(resolved),
          catch: resolved.catch.bind(resolved),
          finally: resolved.finally.bind(resolved),
        }
        return countChain
      }

      // Segunda llamada: membresía del usuario — .select('role').eq(...).eq(...).single()
      return makeChain({ data: membership, error: null })
    }

    if (table === 'projects') {
      return makeChain({ data: projects, error: null })
    }

    if (table === 'feedbacks') {
      return makeChain({ data: feedbacks, error: null })
    }

    if (table === 'profiles') {
      return makeChain({ data: profiles, error: null })
    }

    return makeChain({ data: null, error: null })
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
    },
    from: fromMock,
  }
}

const defaultParams = Promise.resolve({ slug: 'startup-madrid' })

// ---------------------------------------------------------------------------
// AC-1: No autenticado → redirect a /login
// ---------------------------------------------------------------------------

describe('CommunityPage — AC-1: no autenticado → redirect /login', () => {
  beforeEach(() => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ user: null, authError: { message: 'not authenticated' } })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/login") cuando no hay sesión', async () => {
    await expect(CommunityPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('llama a redirect exactamente una vez', async () => {
    await expect(CommunityPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-2: Comunidad no existe → notFound()
// ---------------------------------------------------------------------------

describe('CommunityPage — AC-2: comunidad no existe → notFound()', () => {
  beforeEach(() => {
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ community: null })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a notFound() cuando la comunidad no existe', async () => {
    await expect(CommunityPage({ params: defaultParams })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-3: Sin membresía → redirect a /communities?error=no-access
// ---------------------------------------------------------------------------

describe('CommunityPage — AC-3: sin membresía → redirect no-access', () => {
  beforeEach(() => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ membership: null })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/communities?error=no-access") cuando no hay membresía', async () => {
    await expect(CommunityPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/communities?error=no-access')
  })
})

// ---------------------------------------------------------------------------
// AC-4: Happy path — renderiza los componentes principales
// ---------------------------------------------------------------------------

describe('CommunityPage — AC-4: happy path con proyectos', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza CommunityFeedHeader', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('feed-header')).toBeInTheDocument()
  })

  it('renderiza CommunityHeader', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('community-header')).toBeInTheDocument()
  })

  it('renderiza ProjectFeed', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('project-feed')).toBeInTheDocument()
  })

  it('renderiza BackButton con href="/communities"', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    const btn = screen.getByTestId('back-button')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/communities')
  })

  it('NO llama a redirect ni notFound en happy path', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-5: El Promise.all paralelo se resuelve — proyectos con datos
// ---------------------------------------------------------------------------

describe('CommunityPage — AC-5: Promise.all resuelve con proyectos', () => {
  const projectRows = [
    {
      id: 'proj-001',
      slug: 'mi-proyecto',
      title: 'Mi proyecto',
      image_urls: [],
      status: 'live',
      builder_id: 'user-456',
      created_at: '2026-01-01T00:00:00Z',
      problem: 'Un problema real',
      tagline: 'Tagline del proyecto',
      would_use_count: 10,
    },
  ]

  const feedbackRows = [{ project_id: 'proj-001' }, { project_id: 'proj-001' }]
  const profileRows = [{ id: 'user-456', name: 'Pedro López' }]

  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        projects: projectRows,
        feedbacks: feedbackRows,
        profiles: profileRows,
      })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza ProjectFeed con datos de proyectos resueltos', async () => {
    const jsx = await CommunityPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('project-feed')).toBeInTheDocument()
  })

  it('NO lanza errores al resolver el batch-fetch de profiles', async () => {
    await expect(CommunityPage({ params: defaultParams })).resolves.toBeDefined()
  })
})
