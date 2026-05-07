// Story 12.3 — Tests del webhook POST /api/webhooks/ai-synthesis
// TDD Outside-In: tests escritos ANTES de la implementación
// AC1: 401 sin secret / secret incorrecto
// AC2: 400 feedbacks insuficientes
// AC3: 200 skip síntesis reciente
// AC4: 429 budget excedido
// AC9/AC5-AC8: 200 OK síntesis generada con upsert + tracking + notificación
// Story 12.6: email enviado/omitido según notification_preferences

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — hoisted para que las variables estén disponibles en factory
// ---------------------------------------------------------------------------

const {
  mockFrom,
  mockCreateClient,
  mockSynthesizeFeedbacks,
  mockTrackCost,
  mockCheckDailyBudget,
  mockSendEmail,
  mockGetUserById,
} = vi.hoisted(() => {
  const mockFrom = vi.fn()
  const mockGetUserById = vi.fn()
  const mockCreateClient = vi.fn().mockReturnValue({
    from: mockFrom,
    auth: { admin: { getUserById: mockGetUserById } },
  })
  const mockSynthesizeFeedbacks = vi.fn()
  const mockTrackCost = vi.fn()
  const mockCheckDailyBudget = vi.fn()
  const mockSendEmail = vi.fn().mockResolvedValue(undefined)
  return {
    mockFrom,
    mockCreateClient,
    mockSynthesizeFeedbacks,
    mockTrackCost,
    mockCheckDailyBudget,
    mockSendEmail,
    mockGetUserById,
  }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  buildAiSynthesisReadyEmail: vi.fn().mockReturnValue({
    subject: 'Tu síntesis de IA está lista para Mi Proyecto',
    html: '<html><body>test</body></html>',
  }),
}))

vi.mock('@/lib/ai', () => ({
  synthesizeFeedbacks: (...args: unknown[]) => mockSynthesizeFeedbacks(...args),
  trackCost: (...args: unknown[]) => mockTrackCost(...args),
  checkDailyBudget: (...args: unknown[]) => mockCheckDailyBudget(...args),
}))

// ---------------------------------------------------------------------------
// Import del handler bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/webhooks/ai-synthesis/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SECRET = 'test-webhook-secret-123'

function buildRequest(body: unknown, secret?: string): NextRequest {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (secret !== undefined) {
    headers['x-webhook-secret'] = secret
  }
  return new NextRequest('http://localhost/api/webhooks/ai-synthesis', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'project-uuid-001'

const MOCK_PROJECT_ROW = {
  id: PROJECT_ID,
  slug: 'my-project',
  builder_id: 'builder-uuid-001',
  title: 'Mi Proyecto',
  community_id: 'community-uuid-001',
  problem: 'Problema',
  solution: 'Solución',
  hypothesis: 'Hipótesis',
  image_urls: [],
  status: 'live',
  decision: null,
  decided_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  target_user: null,
  demo_url: null,
  feedback_topics: null,
  tagline: null,
  would_use_count: 0,
  template_id: null,
  custom_question: null,
  quality_threshold: 0.6,
}

const MOCK_FEEDBACKS = [
  {
    id: 'fb-001',
    project_id: PROJECT_ID,
    reviewer_id: 'reviewer-001',
    community_id: 'community-uuid-001',
    scores: { p1: 3, p2: 3, p3: 3 },
    text_responses: { p4: 'Excelente idea' },
    created_at: '2026-01-01T00:00:00Z',
    custom_answer: null,
    quality_score: 0.8,
  },
  {
    id: 'fb-002',
    project_id: PROJECT_ID,
    reviewer_id: 'reviewer-002',
    community_id: 'community-uuid-001',
    scores: { p1: 2, p2: 3, p3: 2 },
    text_responses: { p4: 'Podría mejorar la UX' },
    created_at: '2026-01-01T01:00:00Z',
    custom_answer: null,
    quality_score: 0.7,
  },
  {
    id: 'fb-003',
    project_id: PROJECT_ID,
    reviewer_id: 'reviewer-003',
    community_id: 'community-uuid-001',
    scores: { p1: 3, p2: 2, p3: 3 },
    text_responses: { p4: 'Mercado con potencial real' },
    created_at: '2026-01-01T02:00:00Z',
    custom_answer: null,
    quality_score: 0.65,
  },
]

const MOCK_SYNTHESIS_RESULT = {
  summaryText: 'Resumen de la síntesis de prueba.',
  keyInsights: ['Insight 1', 'Insight 2'],
  model: 'qwen2.5:3b',
  tokensInput: 150,
  tokensOutput: 200,
  costUsd: 0.0,
}

// ---------------------------------------------------------------------------
// Helpers para construir chains de Supabase
// ---------------------------------------------------------------------------

type SupabaseQueryResult<T> = { data: T | null; error: null | { message: string; code?: string } }

function mockChain<T>(result: SupabaseQueryResult<T>) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ data: [{ id: 'summary-uuid-001' }], error: null }),
  }
  return chain
}

// ---------------------------------------------------------------------------
// Setup — restaurar env y mocks entre tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubEnv('WEBHOOK_SECRET', VALID_SECRET)
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key-test')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://proof-day.com')

  mockSynthesizeFeedbacks.mockReset()
  mockTrackCost.mockReset()
  mockCheckDailyBudget.mockReset()
  mockFrom.mockReset()
  mockSendEmail.mockReset().mockResolvedValue(undefined)
  mockGetUserById.mockReset()

  // Por defecto el builder tiene email
  mockGetUserById.mockResolvedValue({
    data: { user: { email: 'builder@example.com' } },
    error: null,
  })

  // Restaurar createClient para que siempre devuelva el cliente con mockFrom + auth admin
  mockCreateClient.mockReturnValue({
    from: mockFrom,
    auth: { admin: { getUserById: mockGetUserById } },
  })
})

// ---------------------------------------------------------------------------
// AC1 — Autenticación por WEBHOOK_SECRET
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC1: autenticación', () => {
  it('retorna 401 cuando no se envía x-webhook-secret', async () => {
    const req = buildRequest({ projectId: PROJECT_ID })
    const response = await POST(req)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('retorna 401 cuando x-webhook-secret es incorrecto', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, 'wrong-secret')
    const response = await POST(req)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('no llama a Supabase cuando el secret es inválido', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, 'wrong-secret')
    await POST(req)

    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC2 — Validación de feedbacks suficientes
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC2: feedbacks insuficientes', () => {
  it('retorna 400 con INSUFFICIENT_FEEDBACKS cuando hay menos de 3 feedbacks completos', async () => {
    const twoFeedbacks = MOCK_FEEDBACKS.slice(0, 2)

    // Setup: proyecto encontrado, 2 feedbacks (insuficiente)
    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        const chain = mockChain({ data: MOCK_PROJECT_ROW, error: null })
        return chain
      }
      if (table === 'feedbacks') {
        callCount++
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: twoFeedbacks, error: null }),
        }
        return chain
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(true)

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('INSUFFICIENT_FEEDBACKS')
    expect(body.count).toBe(2)
    void callCount // evitar warning de no uso
  })
})

// ---------------------------------------------------------------------------
// AC3 — Skip si síntesis reciente (< 24h)
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC3: skip síntesis reciente', () => {
  it('retorna 200 con skipped:true cuando la síntesis tiene menos de 24h', async () => {
    const recentUpdatedAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // hace 3h

    const RECENT_SUMMARY = {
      id: 'summary-uuid-001',
      project_id: PROJECT_ID,
      content: 'Resumen anterior',
      feedback_count_at_generation: 5,
      model: 'qwen2.5:3b',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: recentUpdatedAt,
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        return mockChain({ data: RECENT_SUMMARY, error: null })
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(true)

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.skipped).toBe(true)
    expect(body.reason).toBe('RECENT_SUMMARY')
  })

  it('NO llama a synthesizeFeedbacks cuando la síntesis es reciente', async () => {
    const recentUpdatedAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // hace 1h

    const RECENT_SUMMARY = {
      id: 'summary-uuid-001',
      project_id: PROJECT_ID,
      content: 'Resumen reciente',
      feedback_count_at_generation: 5,
      model: 'qwen2.5:3b',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: recentUpdatedAt,
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        return mockChain({ data: RECENT_SUMMARY, error: null })
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(true)

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockSynthesizeFeedbacks).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC4 — Control de presupuesto diario
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC4: budget excedido', () => {
  it('retorna 429 con BUDGET_EXCEEDED cuando el presupuesto está agotado', async () => {
    // Sin síntesis previa (null) → no hay skip → checkDailyBudget da false
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        // No existe síntesis previa
        return mockChain({ data: null, error: { message: 'No rows found', code: 'PGRST116' } })
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(false) // presupuesto agotado

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(429)
    const body = await response.json()
    expect(body.error).toBe('BUDGET_EXCEEDED')
  })

  it('NO llama a synthesizeFeedbacks cuando el presupuesto está agotado', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        return mockChain({ data: null, error: { message: 'No rows found', code: 'PGRST116' } })
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(false)

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockSynthesizeFeedbacks).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC5–AC9 — Flujo exitoso completo
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC5-AC9: síntesis exitosa', () => {
  beforeEach(() => {
    const mockUpsertChain = {
      upsert: vi.fn().mockResolvedValue({
        data: [{ id: 'summary-uuid-001' }],
        error: null,
      }),
    }
    const mockInsertNotifChain = {
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        // Primera llamada: SELECT para check de síntesis reciente → sin síntesis previa
        // Segunda llamada: upsert
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          ...mockUpsertChain,
        }
      }
      if (table === 'notifications') {
        return mockInsertNotifChain
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(true)
    mockSynthesizeFeedbacks.mockResolvedValue(MOCK_SYNTHESIS_RESULT)
    mockTrackCost.mockResolvedValue(undefined)
  })

  it('retorna 200 con success:true, projectId y summaryId', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.projectId).toBe(PROJECT_ID)
    expect(typeof body.summaryId).toBe('string')
  })

  it('llama a synthesizeFeedbacks con los feedbacks y el proyecto', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockSynthesizeFeedbacks).toHaveBeenCalledOnce()
    const [feedbacksArg, projectArg] = mockSynthesizeFeedbacks.mock.calls[0] as [unknown[], { id: string }]
    expect(feedbacksArg).toHaveLength(3)
    expect(projectArg.id).toBe(PROJECT_ID)
  })

  it('llama a trackCost con los tokens de la síntesis', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockTrackCost).toHaveBeenCalledOnce()
    const [trackInput] = mockTrackCost.mock.calls[0] as [{ tokensInput: number; tokensOutput: number }]
    expect(trackInput.tokensInput).toBe(MOCK_SYNTHESIS_RESULT.tokensInput)
    expect(trackInput.tokensOutput).toBe(MOCK_SYNTHESIS_RESULT.tokensOutput)
  })

  it('usa el service role client (createClient de @supabase/supabase-js)', async () => {
    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockCreateClient).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// AC7 — Notificación in-app al Builder
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/ai-synthesis — AC7: notificación al builder', () => {
  it('inserta una notificación en la tabla notifications con los campos correctos', async () => {
    const mockNotifInsert = vi.fn().mockResolvedValue({ data: null, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return mockChain({ data: MOCK_PROJECT_ROW, error: null })
      }
      if (table === 'feedbacks') {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
        }
        return chain
      }
      if (table === 'ai_summaries') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          upsert: vi.fn().mockResolvedValue({ data: [{ id: 'summary-uuid-001' }], error: null }),
        }
      }
      if (table === 'communities') {
        // Mock para la consulta del communitySlug (Story 12.5)
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { slug: 'startup-madrid' }, error: null }),
        }
      }
      if (table === 'notifications') {
        return { insert: mockNotifInsert }
      }
      return mockChain({ data: null, error: null })
    })

    mockCheckDailyBudget.mockResolvedValue(true)
    mockSynthesizeFeedbacks.mockResolvedValue(MOCK_SYNTHESIS_RESULT)
    mockTrackCost.mockResolvedValue(undefined)

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    await POST(req)

    expect(mockNotifInsert).toHaveBeenCalledOnce()
    const [notifData] = mockNotifInsert.mock.calls[0] as [
      { user_id: string; type: string; payload: Record<string, unknown>; read: boolean }
    ]
    expect(notifData.user_id).toBe(MOCK_PROJECT_ROW.builder_id)
    expect(notifData.type).toBe('ai_synthesis_ready')
    expect(notifData.payload.projectId).toBe(PROJECT_ID)
    expect(notifData.payload.projectSlug).toBe(MOCK_PROJECT_ROW.slug)
    expect(notifData.payload.projectTitle).toBe(MOCK_PROJECT_ROW.title)
    // Story 12.5: communitySlug ahora se incluye en el payload
    expect(notifData.payload.communitySlug).toBe('startup-madrid')
    expect(notifData.read).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Story 12.6 — Envío de email vía Resend
// ---------------------------------------------------------------------------

/**
 * Helper: construye el mockFrom para el flujo exitoso completo (con comunidad).
 * Reutilizado en los 2 nuevos tests de email.
 */
function buildSuccessfulFlowMockFrom(prefData: { email_enabled: boolean } | null) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'projects') {
      return mockChain({ data: MOCK_PROJECT_ROW, error: null })
    }
    if (table === 'feedbacks') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACKS, error: null }),
      }
    }
    if (table === 'ai_summaries') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ data: [{ id: 'summary-uuid-001' }], error: null }),
      }
    }
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { slug: 'startup-madrid' }, error: null }),
      }
    }
    if (table === 'notifications') {
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
    }
    if (table === 'notification_preferences') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: prefData, error: null }),
      }
    }
    return mockChain({ data: null, error: null })
  })
}

describe('POST /api/webhooks/ai-synthesis — Story 12.6: envío de email', () => {
  beforeEach(() => {
    mockCheckDailyBudget.mockResolvedValue(true)
    mockSynthesizeFeedbacks.mockResolvedValue(MOCK_SYNTHESIS_RESULT)
    mockTrackCost.mockResolvedValue(undefined)
    mockSendEmail.mockResolvedValue(undefined)
    mockGetUserById.mockResolvedValue({
      data: { user: { email: 'builder@example.com' } },
      error: null,
    })
  })

  it('envía email cuando email_enabled=true en notification_preferences', async () => {
    buildSuccessfulFlowMockFrom({ email_enabled: true })

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    // Fire-and-forget: el test verifica que sendEmail fue llamado
    // Puede haber un pequeño delay, pero en el mismo tick de event loop se llama
    expect(mockSendEmail).toHaveBeenCalledOnce()
    const [emailArgs] = mockSendEmail.mock.calls[0] as [
      { to: string; subject: string; html: string }
    ]
    expect(emailArgs.to).toBe('builder@example.com')
  })

  it('envía email cuando no hay fila en notification_preferences (default email_enabled=true)', async () => {
    buildSuccessfulFlowMockFrom(null) // sin fila → default true

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledOnce()
  })

  it('NO envía email cuando email_enabled=false en notification_preferences', async () => {
    buildSuccessfulFlowMockFrom({ email_enabled: false })

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('retorna 200 cuando getUserById devuelve data:null (usuario no encontrado)', async () => {
    buildSuccessfulFlowMockFrom({ email_enabled: true })
    // Simular que Supabase devuelve data:null en lugar de lanzar excepción
    mockGetUserById.mockResolvedValue({ data: null, error: { message: 'User not found' } })

    const req = buildRequest({ projectId: PROJECT_ID }, VALID_SECRET)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
