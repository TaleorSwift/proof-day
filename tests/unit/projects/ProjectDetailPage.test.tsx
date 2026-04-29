// @vitest-environment jsdom
/**
 * Tests — ProjectPage ([slug]/projects/[projectSlug]/page.tsx)
 * Server Component — verifica redirects, notFound y branching isOwner.
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
  createClientMock,
  mockProjectStateActions,
  mockFeedbackList,
  mockFeedbackFormInline,
  mockProofScoreSidebar,
  mockDraftBanner,
  mockInactiveBanner,
  createFeedbackRepoMock,
  createProfilesRepoMock,
} = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockNotFound: vi.fn(),
  createClientMock: vi.fn(),
  mockProjectStateActions: vi.fn(),
  mockFeedbackList: vi.fn(),
  mockFeedbackFormInline: vi.fn(),
  mockProofScoreSidebar: vi.fn(),
  mockDraftBanner: vi.fn(),
  mockInactiveBanner: vi.fn(),
  createFeedbackRepoMock: vi.fn(),
  createProfilesRepoMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: createClientMock,
}))

vi.mock('@/lib/repositories/feedback.repository', () => ({
  createFeedbackRepository: createFeedbackRepoMock,
}))

vi.mock('@/lib/repositories/profiles.repository', () => ({
  createProfilesRepository: createProfilesRepoMock,
}))

vi.mock('@/components/projects/ProjectStateActions', () => ({
  ProjectStateActions: (props: Record<string, unknown>) => {
    mockProjectStateActions(props)
    return <div data-testid='project-state-actions' />
  },
}))

vi.mock('@/components/feedback/FeedbackList', () => ({
  FeedbackList: (props: Record<string, unknown>) => {
    mockFeedbackList(props)
    return <div data-testid='feedback-list' />
  },
}))

vi.mock('@/components/feedback/FeedbackFormInline', () => ({
  FeedbackFormInline: (props: Record<string, unknown>) => {
    mockFeedbackFormInline(props)
    return <div data-testid='feedback-form-inline' />
  },
}))

vi.mock('@/components/proof-score/ProofScoreSidebar', () => ({
  ProofScoreSidebar: (props: Record<string, unknown>) => {
    mockProofScoreSidebar(props)
    return <div data-testid='proof-score-sidebar' />
  },
}))

vi.mock('@/components/projects/DraftBanner', () => ({
  DraftBanner: () => {
    mockDraftBanner()
    return <div data-testid='draft-banner' />
  },
}))

vi.mock('@/components/projects/InactiveBanner', () => ({
  InactiveBanner: () => {
    mockInactiveBanner()
    return <div data-testid='inactive-banner' />
  },
}))

// Mocks de componentes sin tracking — solo necesitan renderizar
vi.mock('@/components/projects/StatusBadge', () => ({
  StatusBadge: () => <div data-testid='status-badge' />,
}))

vi.mock('@/components/feedback/FeedbackCounter', () => ({
  FeedbackCounter: () => <div data-testid='feedback-counter' />,
}))

vi.mock('@/components/feedback/TeamPerspectives', () => ({
  TeamPerspectives: () => <div data-testid='team-perspectives' />,
}))

vi.mock('@/components/feedback/FeedbackCTA', () => ({
  FeedbackCTA: () => <div data-testid='feedback-cta' />,
}))

vi.mock('@/components/proof-score/ValidationSignalCard', () => ({
  ValidationSignalCard: () => <div data-testid='validation-signal-card' />,
}))

vi.mock('@/components/projects/ProjectDetailSections', () => ({
  ProjectDetailAuthor: () => <div data-testid='project-detail-author' />,
  ProjectDetailFeaturedImage: () => <div data-testid='project-detail-image' />,
  ProjectDetailTargetUser: () => <div data-testid='project-detail-target-user' />,
  ProjectDetailDemo: () => <div data-testid='project-detail-demo' />,
  ProjectDetailFeedbackTopics: () => <div data-testid='project-detail-feedback-topics' />,
}))

vi.mock('@/components/shared/BackButton', () => ({
  BackButton: ({ href, label }: { href: string; label: string }) => (
    <a href={href} data-testid='back-button'>{label}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('@/lib/projects/calculateValidationMetrics', () => ({
  calculateValidationMetrics: vi.fn().mockReturnValue({
    understandPercent: 75,
    wouldUsePercent: 50,
  }),
}))

import ProjectPage from '@/app/(app)/communities/[slug]/projects/[projectSlug]/page'

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

const OWNER_ID = 'user-owner-123'
const OTHER_USER_ID = 'user-other-456'
const COMMUNITY_ID = 'comm-001'
const PROJECT_ID = 'proj-001'

const defaultProject = {
  id: PROJECT_ID,
  slug: 'pulse-check',
  title: 'Pulse Check',
  tagline: 'Anonymous weekly mood tracking',
  problem: 'Remote teams lose track of morale.',
  solution: 'Weekly pulse surveys.',
  hypothesis: 'Team leads will intervene faster.',
  image_urls: [],
  status: 'live' as const,
  builder_id: OWNER_ID,
  community_id: COMMUNITY_ID,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  decision: null,
  target_user: 'Engineering managers',
  demo_url: null,
  feedback_topics: ['Problem clarity'],
}

const defaultCommunity = { id: COMMUNITY_ID }

const makeSupabaseMock = (overrides: {
  userId?: string | null
  authError?: object | null
  community?: object | null
  project?: object | null
} = {}) => {
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

const defaultParams = Promise.resolve({ slug: 'producto-alpha', projectSlug: 'pulse-check' })

// ---------------------------------------------------------------------------
// Setup común de repos
// ---------------------------------------------------------------------------

function setupDefaultRepos() {
  createFeedbackRepoMock.mockReturnValue({
    findByProject: vi.fn().mockResolvedValue({ data: [], error: null }),
  })
  createProfilesRepoMock.mockReturnValue({
    findByIdForWidget: vi.fn().mockResolvedValue({ data: { name: 'Alex Builder' }, error: null }),
  })
}

// ---------------------------------------------------------------------------
// AC-1: No autenticado → redirect /login
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-1: no autenticado → redirect /login', () => {
  beforeEach(() => {
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: null, authError: { message: 'not authenticated' } })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a redirect("/login") cuando no hay sesión', async () => {
    await expect(ProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

// ---------------------------------------------------------------------------
// AC-2: Comunidad no existe → notFound()
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-2: comunidad no existe → notFound()', () => {
  beforeEach(() => {
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ community: null })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a notFound() cuando la comunidad no existe', async () => {
    await expect(ProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-3: Proyecto no existe → notFound()
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-3: proyecto no existe → notFound()', () => {
  beforeEach(() => {
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ project: null })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('llama a notFound() cuando el proyecto no existe', async () => {
    await expect(ProjectPage({ params: defaultParams })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// AC-4: isOwner = true → FeedbackList y ProjectStateActions se renderizan
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-4: isOwner = true → sidebar de owner', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: OWNER_ID })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza FeedbackList cuando el usuario es el builder', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('feedback-list')).toBeInTheDocument()
  })

  it('renderiza ProjectStateActions cuando el usuario es el builder', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('project-state-actions')).toBeInTheDocument()
  })

  it('NO renderiza FeedbackFormInline cuando el usuario es el builder', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('feedback-form-inline')).not.toBeInTheDocument()
  })

  it('pasa isBuilder: true a ProjectStateActions', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProjectStateActions).toHaveBeenCalledWith(
      expect.objectContaining({ isBuilder: true })
    )
  })

  it('pasa isBuilder: true a ProofScoreSidebar', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockProofScoreSidebar).toHaveBeenCalledWith(
      expect.objectContaining({ isBuilder: true })
    )
  })

  it('pasa isBuilder: true a FeedbackList', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockFeedbackList).toHaveBeenCalledWith(
      expect.objectContaining({ isBuilder: true })
    )
  })
})

// ---------------------------------------------------------------------------
// AC-5: isOwner = false → FeedbackFormInline se renderiza (proyecto live)
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-5: isOwner = false → sidebar de reviewer (live)', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: OTHER_USER_ID })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza FeedbackFormInline cuando el usuario NO es el builder y el proyecto es live', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('feedback-form-inline')).toBeInTheDocument()
  })

  it('NO renderiza FeedbackList cuando el usuario NO es el builder', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('feedback-list')).not.toBeInTheDocument()
  })

  it('NO renderiza ProjectStateActions cuando el usuario NO es el builder', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('project-state-actions')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC-6: Proyecto draft — DraftBanner visible, FeedbackFormInline no visible para reviewer
// Nota: el page.tsx no protege drafts de non-owners con redirect/notFound.
// Un reviewer que visita un draft verá el contenido pero sin FeedbackFormInline
// (la sidebar no se muestra para draft + non-owner según showSidebar logic).
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-6: proyecto draft + non-owner', () => {
  const draftProject = { ...defaultProject, status: 'draft', builder_id: OWNER_ID }

  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({ userId: OTHER_USER_ID, project: draftProject })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza DraftBanner cuando el proyecto está en borrador', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockDraftBanner).toHaveBeenCalled()
  })

  it('NO renderiza FeedbackFormInline para reviewer en proyecto draft (sidebar oculta)', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    // showSidebar = isOwner || live || inactive → false para non-owner + draft
    expect(screen.queryByTestId('feedback-form-inline')).not.toBeInTheDocument()
  })

  it('NO llama a redirect ni notFound para non-owner en draft (no hay protección de ruta)', async () => {
    await ProjectPage({ params: defaultParams })
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC-7: Happy path — BackButton y estructura base se renderizan
// ---------------------------------------------------------------------------

describe('ProjectPage — AC-7: happy path renderiza estructura base', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(makeSupabaseMock())
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza BackButton con href a la comunidad', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    const btn = screen.getByTestId('back-button')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/communities/producto-alpha')
  })

  it('NO llama a redirect ni notFound en happy path', async () => {
    const jsx = await ProjectPage({ params: defaultParams })
    render(jsx as React.ReactElement)
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})
