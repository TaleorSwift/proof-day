// @vitest-environment jsdom
/**
 * Tests — Story 13.6: Historial de versiones y Proof Score por iteración
 * ProjectPage — tests de integración para la query de project_iterations
 * y la sección IterationHistory.
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
  mockValidationSignalCard,
  mockIterationHistory,
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
  mockValidationSignalCard: vi.fn(),
  mockIterationHistory: vi.fn(),
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
  ValidationSignalCard: (props: Record<string, unknown>) => {
    mockValidationSignalCard(props)
    return <div data-testid='validation-signal-card' />
  },
}))

vi.mock('@/components/projects/ProjectDetailSections', () => ({
  ProjectDetailAuthor: () => <div data-testid='project-detail-author' />,
  ProjectDetailFeaturedImage: () => <div data-testid='project-detail-image' />,
  ProjectDetailTargetUser: () => <div data-testid='project-detail-target-user' />,
  ProjectDetailDemo: () => <div data-testid='project-detail-demo' />,
  ProjectDetailFeedbackTopics: () => <div data-testid='project-detail-feedback-topics' />,
}))

vi.mock('@/components/projects/AISummaryCard', () => ({
  AISummaryCard: () => <div data-testid='ai-summary-card-mock' />,
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

// Mock IterationHistory para tests de integración en page.tsx
vi.mock('@/components/projects/IterationHistory', () => ({
  IterationHistory: (props: Record<string, unknown>) => {
    mockIterationHistory(props)
    const iterations = props.iterations as Array<{ versionNumber: number }>
    if (!iterations || iterations.length === 0) return null
    return <div data-testid='iteration-history-mock' />
  },
}))

import ProjectPage from '@/app/(app)/communities/[slug]/projects/[projectSlug]/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChainWithOrder(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'single', 'maybeSingle', 'order', 'not']
  for (const method of methods) {
    if (method === 'single' || method === 'maybeSingle') {
      chain[method] = vi.fn().mockResolvedValue(resolvedValue)
    } else if (method === 'order' || method === 'not') {
      // order() y not() retornan una Promise directamente (query sin .single())
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
  quality_threshold: 0.6,
  custom_question: null,
}

const defaultCommunity = { id: COMMUNITY_ID }

const iterationRows = [
  { id: 'iter-2', version_number: 2, published_at: '2026-05-01T10:00:00Z' },
  { id: 'iter-1', version_number: 1, published_at: '2026-03-15T10:00:00Z' },
]

const feedbackCountRows = [
  { iteration_id: 'iter-1' },
  { iteration_id: 'iter-1' },
  { iteration_id: 'iter-2' },
]

function makeSupabaseMock(overrides: {
  userId?: string | null
  authError?: object | null
  community?: object | null
  project?: object | null
  iterations?: object[] | null
  feedbackCounts?: object[] | null
} = {}) {
  const {
    userId = OWNER_ID,
    authError = null,
    community = defaultCommunity,
    project = defaultProject,
    iterations = null,
    feedbackCounts = null,
  } = overrides

  const fromMock = vi.fn().mockImplementation((table: string) => {
    if (table === 'communities') {
      const chain = makeChainWithOrder({ data: community, error: null })
      return chain
    }
    if (table === 'projects') {
      const chain = makeChainWithOrder({ data: project, error: null })
      return chain
    }
    if (table === 'project_iterations') {
      const chain = makeChainWithOrder({ data: iterations, error: null })
      return chain
    }
    if (table === 'feedbacks') {
      const chain = makeChainWithOrder({ data: feedbackCounts, error: null })
      return chain
    }
    if (table === 'ai_summaries') {
      const chain = makeChainWithOrder({ data: null, error: null })
      return chain
    }
    return makeChainWithOrder({ data: null, error: null })
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
const defaultSearchParams = Promise.resolve({})

function setupDefaultRepos() {
  createFeedbackRepoMock.mockReturnValue({
    findByProject: vi.fn().mockResolvedValue({ data: [], error: null }),
  })
  createProfilesRepoMock.mockReturnValue({
    findByIdForWidget: vi.fn().mockResolvedValue({ data: { name: 'Alex Builder' }, error: null }),
  })
}

// ---------------------------------------------------------------------------
// AC1: Sección visible cuando hay iteraciones
// ---------------------------------------------------------------------------

describe('ProjectDetailPage 13.6 — AC1: historial visible con iteraciones', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        iterations: iterationRows,
        feedbackCounts: feedbackCountRows,
      })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza IterationHistory cuando el proyecto tiene iteraciones', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('iteration-history-mock')).toBeInTheDocument()
  })

  it('pasa las iteraciones mapeadas a IterationHistory', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(mockIterationHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        iterations: expect.arrayContaining([
          expect.objectContaining({ versionNumber: 2 }),
          expect.objectContaining({ versionNumber: 1 }),
        ]),
      })
    )
  })

  it('historial es visible para un reviewer (non-owner)', async () => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        userId: OTHER_USER_ID,
        iterations: iterationRows,
        feedbackCounts: feedbackCountRows,
      })
    )
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.getByTestId('iteration-history-mock')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AC1: Sección NO visible cuando no hay iteraciones
// ---------------------------------------------------------------------------

describe('ProjectDetailPage 13.6 — AC1: historial oculto sin iteraciones', () => {
  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        iterations: [],
        feedbackCounts: [],
      })
    )
    setupDefaultRepos()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('NO renderiza IterationHistory cuando no hay iteraciones', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(screen.queryByTestId('iteration-history-mock')).not.toBeInTheDocument()
  })

  it('pasa array vacío a IterationHistory cuando no hay iteraciones', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    expect(mockIterationHistory).toHaveBeenCalledWith(
      expect.objectContaining({ iterations: [] })
    )
  })
})

// ---------------------------------------------------------------------------
// AC3: Proof Score filtrado por iteración más reciente
// ---------------------------------------------------------------------------

describe('ProjectDetailPage 13.6 — AC3: Proof Score filtrado por iteración reciente', () => {
  const feedbacksConIteracion = [
    {
      id: 'fb-001',
      project_id: PROJECT_ID,
      created_at: '2026-05-01T00:00:00Z',
      scores: { p1: 3, p2: 3 },
      text_responses: {},
      profiles: { name: 'Ana García' },
      iteration_id: 'iter-2',  // iteración más reciente
      quality_score: null,
    },
    {
      id: 'fb-002',
      project_id: PROJECT_ID,
      created_at: '2026-03-15T00:00:00Z',
      scores: { p1: 1, p2: 1 },
      text_responses: {},
      profiles: { name: 'Luis Ruiz' },
      iteration_id: 'iter-1',  // iteración anterior
      quality_score: null,
    },
  ]

  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        iterations: iterationRows,  // iter-2 es la más reciente (version_number DESC)
        feedbackCounts: feedbackCountRows,
      })
    )
    createFeedbackRepoMock.mockReturnValue({
      findByProject: vi.fn().mockResolvedValue({ data: feedbacksConIteracion, error: null }),
    })
    createProfilesRepoMock.mockReturnValue({
      findByIdForWidget: vi.fn().mockResolvedValue({ data: { name: 'Alex Builder' }, error: null }),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('ProofScoreSidebar recibe feedbackCount de la iteración más reciente', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    // iter-2 es la más reciente; solo fb-001 tiene iteration_id: 'iter-2'
    // feedbackCount para el ProofScoreSidebar debe ser 1 (solo fb de iter-2)
    expect(mockProofScoreSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbackCount: 1,
      })
    )
  })
})

// ---------------------------------------------------------------------------
// AC3: Sin iteraciones — Proof Score usa todos los feedbacks
// ---------------------------------------------------------------------------

describe('ProjectDetailPage 13.6 — AC3: sin iteraciones, Proof Score usa todos los feedbacks', () => {
  const allFeedbacks = [
    {
      id: 'fb-001',
      project_id: PROJECT_ID,
      created_at: '2026-05-01T00:00:00Z',
      scores: { p1: 3, p2: 3 },
      text_responses: {},
      profiles: { name: 'Ana García' },
      iteration_id: null,
      quality_score: null,
    },
    {
      id: 'fb-002',
      project_id: PROJECT_ID,
      created_at: '2026-03-15T00:00:00Z',
      scores: { p1: 2, p2: 2 },
      text_responses: {},
      profiles: { name: 'Luis Ruiz' },
      iteration_id: null,
      quality_score: null,
    },
  ]

  beforeEach(() => {
    createClientMock.mockResolvedValue(
      makeSupabaseMock({
        iterations: [],    // sin iteraciones
        feedbackCounts: [],
      })
    )
    createFeedbackRepoMock.mockReturnValue({
      findByProject: vi.fn().mockResolvedValue({ data: allFeedbacks, error: null }),
    })
    createProfilesRepoMock.mockReturnValue({
      findByIdForWidget: vi.fn().mockResolvedValue({ data: { name: 'Alex Builder' }, error: null }),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('ProofScoreSidebar recibe todos los feedbacks cuando no hay iteraciones', async () => {
    const jsx = await ProjectPage({ params: defaultParams, searchParams: defaultSearchParams })
    render(jsx as React.ReactElement)
    // Sin iteraciones: feedbackCount = 2 (todos los feedbacks)
    expect(mockProofScoreSidebar).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbackCount: 2,
      })
    )
  })
})
