// @vitest-environment jsdom
/**
 * Tests — EditProjectPage (app/(app)/communities/[slug]/projects/[projectSlug]/edit/page.tsx)
 * Server Component — sin interactividad de cliente
 * Verifica: redirect no-auth, redirect non-owner, notFound non-draft, happy path.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockRedirect, mockNotFound, createClientMock, mockProjectForm } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
  createClientMock: vi.fn(),
  mockProjectForm: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/components/projects/ProjectForm', () => ({
  ProjectForm: (props: Record<string, unknown>) => {
    mockProjectForm(props)
    return <div data-testid="project-form" />
  },
}))

import EditProjectPage from '@/app/(app)/communities/[slug]/projects/[projectSlug]/edit/page'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const OWNER_ID = 'user-owner-123'
const OTHER_USER_ID = 'user-other-456'
const COMMUNITY_ID = 'comm-001'
const PROJECT_ID = 'proj-001'
const COMMUNITY_SLUG = 'producto-alpha'
const PROJECT_SLUG = 'mi-proyecto-draft'

const defaultCommunity = { id: COMMUNITY_ID, name: 'Producto Alpha' }

const defaultProject = {
  id: PROJECT_ID,
  slug: PROJECT_SLUG,
  title: 'Mi Proyecto Draft',
  problem: 'Un problema real.',
  solution: 'Una solución efectiva.',
  hypothesis: 'Si lo lanzamos, el 80% lo usará.',
  image_urls: [],
  status: 'draft' as const,
  builder_id: OWNER_ID,
  community_id: COMMUNITY_ID,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  decision: null,
  decided_at: null,
  target_user: null,
  demo_url: null,
  feedback_topics: null,
  tagline: null,
  would_use_count: 0,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'single']
  for (const method of methods) {
    if (method === 'single') {
      chain[method] = vi.fn().mockResolvedValue(resolvedValue)
    } else {
      chain[method] = vi.fn().mockReturnValue(chain)
    }
  }
  return chain
}

function makeSupabaseMock(overrides: {
  userId?: string | null
  authError?: object | null
  community?: object | null
  project?: object | null
} = {}) {
  const {
    userId = OWNER_ID,
    authError = null,
    community = defaultCommunity,
    project = defaultProject,
  } = overrides

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'communities') {
      return makeChain({ data: community, error: null })
    }
    if (table === 'projects') {
      return makeChain({ data: project, error: null })
    }
    return makeChain({ data: null, error: null })
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email: 'test@example.com' } : null },
        error: authError,
      }),
    },
    from: fromMock,
  }
}

const defaultParams = Promise.resolve({ slug: COMMUNITY_SLUG, projectSlug: PROJECT_SLUG })

// ---------------------------------------------------------------------------
// AC-1: No autenticado → redirect /login
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-1: no autenticado → redirect /login', () => {
  beforeEach(() => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: null, authError: { message: 'not authenticated' } })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/login") cuando no hay sesión', async () => {
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// AC-2: Non-owner → redirect a la página del proyecto
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-2: non-owner → redirect a la página del proyecto', () => {
  beforeEach(() => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: OTHER_USER_ID })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect a la ruta del proyecto cuando el usuario no es el builder', async () => {
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith(
      `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_SLUG}`
    )
  })
})

// ---------------------------------------------------------------------------
// AC-3: Proyecto no-draft → redirect al detalle del proyecto
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-3: proyecto live → redirect al detalle', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ project: { ...defaultProject, status: 'live' } })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('redirige al detalle cuando el proyecto tiene status live', async () => {
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith(
      `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_SLUG}`
    )
  })
})

describe('EditProjectPage — AC-3b: proyecto inactive → redirect al detalle', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ project: { ...defaultProject, status: 'inactive' } })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('redirige al detalle cuando el proyecto tiene status inactive', async () => {
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith(
      `/communities/${COMMUNITY_SLUG}/projects/${PROJECT_SLUG}`
    )
  })
})

// ---------------------------------------------------------------------------
// AC-4: Owner + draft → renderiza ProjectForm con defaultValues correctos
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-4: owner + draft → happy path', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(makeSupabaseMock())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza ProjectForm cuando el usuario es el owner y el proyecto es draft', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('project-form')).toBeInTheDocument()
  })

  it('pasa projectId correcto a ProjectForm', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProjectForm).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: PROJECT_ID })
    )
  })

  it('pasa communityId correcto a ProjectForm', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProjectForm).toHaveBeenCalledWith(
      expect.objectContaining({ communityId: COMMUNITY_ID })
    )
  })

  it('pasa communitySlug correcto a ProjectForm', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProjectForm).toHaveBeenCalledWith(
      expect.objectContaining({ communitySlug: COMMUNITY_SLUG })
    )
  })

  it('pasa defaultValues con los datos del proyecto a ProjectForm', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProjectForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: expect.objectContaining({
          id: PROJECT_ID,
          title: 'Mi Proyecto Draft',
          status: 'draft',
        }),
      })
    )
  })

  it('NO llama a redirect ni notFound en el happy path', async () => {
    const jsx = await EditProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-5: Comunidad no existe → notFound()
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-5: comunidad no existe → notFound()', () => {
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
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-6: Proyecto no existe → notFound()
// ---------------------------------------------------------------------------

describe('EditProjectPage — AC-6: proyecto no existe → notFound()', () => {
  beforeEach(() => {
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ project: null })
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a notFound() cuando el proyecto no existe', async () => {
    await expect(EditProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})
