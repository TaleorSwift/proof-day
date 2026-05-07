// Story 13.8 — Tests de GET /api/projects/[id]/score-interpretation
// TDD Outside-In: tests escritos ANTES de la implementación
//
// Comportamientos cubiertos:
//   - 401 sin token de sesión
//   - 403 si el usuario no es el builder del proyecto
//   - 404 si el proyecto no existe
//   - 400 con INSUFFICIENT_DATA si el proyecto no tiene suficientes feedbacks
//   - 429 con BUDGET_EXCEEDED si el presupuesto diario está agotado
//   - 503 con AI_UNAVAILABLE si Ollama falla
//   - 200 con { interpretation: string } cuando Ollama responde correctamente
//   - trackCost llamado con communityId correcto

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — hoisted para que las variables estén disponibles en factory
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  mockFrom,
  mockCreateClient,
  mockCheckDailyBudget,
  mockGenerate,
  mockGetOllamaClient,
  mockTrackCost,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockFrom = vi.fn()
  const mockCreateClient = vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })
  const mockGenerate = vi.fn()
  const mockGetOllamaClient = vi.fn().mockReturnValue({ generate: mockGenerate })
  const mockCheckDailyBudget = vi.fn()
  const mockTrackCost = vi.fn()
  return {
    mockGetUser,
    mockFrom,
    mockCreateClient,
    mockCheckDailyBudget,
    mockGenerate,
    mockGetOllamaClient,
    mockTrackCost,
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/ai', () => ({
  getOllamaClient: mockGetOllamaClient,
  checkDailyBudget: mockCheckDailyBudget,
  trackCost: mockTrackCost,
}))

// ---------------------------------------------------------------------------
// Import del handler bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { GET, buildInterpretationPrompt } from '@/app/api/projects/[id]/score-interpretation/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER_ID = 'user-builder-001'
const OTHER_USER_ID = 'user-other-002'
const PROJECT_ID = 'project-uuid-001'
const COMMUNITY_ID = 'community-uuid-001'

const MOCK_USER = { id: USER_ID, email: 'builder@example.com' }
const MOCK_OTHER_USER = { id: OTHER_USER_ID, email: 'other@example.com' }

const MOCK_PROJECT = {
  id: PROJECT_ID,
  builder_id: USER_ID,
  community_id: COMMUNITY_ID,
  title: 'Mi Proyecto de Prueba',
  problem: 'Los emprendedores no saben cómo validar sus ideas.',
}

const MOCK_FEEDBACKS = [
  { scores: { p1: 3, p2: 3, p3: 3 } },
  { scores: { p1: 2, p2: 3, p3: 2 } },
  { scores: { p1: 3, p2: 2, p3: 3 } },
]

const OLLAMA_RESPONSE = {
  response:
    'Tu proyecto está mostrando señales prometedoras. Continúa recopilando feedback para fortalecer la validación.',
  eval_count: 25,
  prompt_eval_count: 80,
}

function makeRequest(projectId: string = PROJECT_ID): NextRequest {
  return new NextRequest(`http://localhost/api/projects/${projectId}/score-interpretation`)
}

// ---------------------------------------------------------------------------
// Helper — construye una cadena de consulta Supabase completa
// ---------------------------------------------------------------------------

function makeQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'order', 'limit', 'maybeSingle', 'single']
  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  // Los métodos terminales retornan la promesa
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue(result)
  ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue(result)
  return chain
}

// ---------------------------------------------------------------------------
// Setup — mockFrom necesita responder a múltiples llamadas
// ---------------------------------------------------------------------------

function setupDefaultMocks() {
  // El handler llama a from() tres veces:
  //   1. from('projects') → .select().eq().single() → project
  //   2. from('project_iterations') → .select().eq().order().limit().maybeSingle() → null (sin iteración)
  //   3. from('feedbacks') → .select().eq() → feedbacks

  const projectChain = makeQueryChain({ data: MOCK_PROJECT, error: null })
  const iterationChain = makeQueryChain({ data: null, error: null })
  const feedbacksChain = makeQueryChain({ data: MOCK_FEEDBACKS, error: null })

  // La query de feedbacks se awaita directamente (retorna Promise con { data, error })
  const feedbacksResult = Promise.resolve({ data: MOCK_FEEDBACKS, error: null })
  // Sobreescribir eq para que retorne la promesa en la segunda llamada de feedbacks
  ;(feedbacksChain.eq as ReturnType<typeof vi.fn>).mockResolvedValue({ data: MOCK_FEEDBACKS, error: null })

  mockFrom.mockImplementation((table: string) => {
    if (table === 'projects') return projectChain
    if (table === 'project_iterations') return iterationChain
    if (table === 'feedbacks') return feedbacksChain
    return makeQueryChain({ data: null, error: null })
  })

  void feedbacksResult
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('GET /api/projects/[id]/score-interpretation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Defaults
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    setupDefaultMocks()
    mockCheckDailyBudget.mockResolvedValue(true)
    mockGenerate.mockResolvedValue(OLLAMA_RESPONSE)
    mockTrackCost.mockResolvedValue(undefined)

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  })

  // ── 401 — sin autenticación ─────────────────────────────────────────────

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })

    expect(res.status).toBe(401)
  })

  it('retorna body con campo error en 401', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(body.error).toBeDefined()
  })

  // ── 403 — no es el builder ───────────────────────────────────────────────

  it('retorna 403 cuando el usuario autenticado no es el builder', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_OTHER_USER } })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })

    expect(res.status).toBe(403)
  })

  it('retorna 403 con error Forbidden', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_OTHER_USER } })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(body.error).toBe('Forbidden')
  })

  // ── 404 — proyecto no existe ─────────────────────────────────────────────

  it('retorna 404 cuando el proyecto no existe', async () => {
    const projectChain = makeQueryChain({ data: null, error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') return projectChain
      return makeQueryChain({ data: null, error: null })
    })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })

    expect(res.status).toBe(404)
  })

  // ── 400 — datos insuficientes ────────────────────────────────────────────

  it('retorna 400 con INSUFFICIENT_DATA cuando hay menos de 3 feedbacks', async () => {
    const twoFeedbacks = [
      { scores: { p1: 3, p2: 3, p3: 3 } },
      { scores: { p1: 2, p2: 2, p3: 2 } },
    ]

    const projectChain = makeQueryChain({ data: MOCK_PROJECT, error: null })
    const iterationChain = makeQueryChain({ data: null, error: null })
    const feedbacksChain = makeQueryChain({ data: twoFeedbacks, error: null })
    ;(feedbacksChain.eq as ReturnType<typeof vi.fn>).mockResolvedValue({ data: twoFeedbacks, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') return projectChain
      if (table === 'project_iterations') return iterationChain
      if (table === 'feedbacks') return feedbacksChain
      return makeQueryChain({ data: null, error: null })
    })

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('INSUFFICIENT_DATA')
  })

  // ── 429 — budget agotado ─────────────────────────────────────────────────

  it('retorna 429 con BUDGET_EXCEEDED cuando el presupuesto está agotado', async () => {
    mockCheckDailyBudget.mockResolvedValue(false)

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(res.status).toBe(429)
    expect(body.error).toBe('BUDGET_EXCEEDED')
  })

  // ── 503 — Ollama no disponible ───────────────────────────────────────────

  it('retorna 503 con AI_UNAVAILABLE cuando Ollama lanza un error', async () => {
    mockGenerate.mockRejectedValue(new Error('Ollama connection refused'))

    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.error).toBe('AI_UNAVAILABLE')
  })

  // ── 200 — respuesta exitosa ──────────────────────────────────────────────

  it('retorna 200 con { interpretation: string } cuando Ollama responde correctamente', async () => {
    const req = makeRequest()
    const res = await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.interpretation).toBe(OLLAMA_RESPONSE.response)
  })

  it('llama a trackCost después de generar la interpretación', async () => {
    const req = makeRequest()
    await GET(req, { params: Promise.resolve({ id: PROJECT_ID }) })

    expect(mockTrackCost).toHaveBeenCalledOnce()
    const callArg = mockTrackCost.mock.calls[0][0]
    expect(callArg).toHaveProperty('communityId', COMMUNITY_ID)
    expect(callArg).toHaveProperty('tokensInput', OLLAMA_RESPONSE.prompt_eval_count)
    expect(callArg).toHaveProperty('tokensOutput', OLLAMA_RESPONSE.eval_count)
    expect(callArg).toHaveProperty('costUsd', 0)
  })
})

// ---------------------------------------------------------------------------
// buildInterpretationPrompt — función pura
// ---------------------------------------------------------------------------

describe('buildInterpretationPrompt', () => {
  const BASE_PARAMS = {
    title: 'Proyecto Test',
    problem: 'Los usuarios no encuentran lo que buscan.',
    scoreLabel: 'Promising' as const,
    average: 2.5,
    feedbackCount: 5,
  }

  it('incluye el título del proyecto en el prompt', () => {
    const prompt = buildInterpretationPrompt(BASE_PARAMS)
    expect(prompt).toContain('Proyecto Test')
  })

  it('incluye el problem del proyecto en el prompt', () => {
    const prompt = buildInterpretationPrompt(BASE_PARAMS)
    expect(prompt).toContain('Los usuarios no encuentran lo que buscan.')
  })

  it('incluye el scoreLabel en el prompt', () => {
    const prompt = buildInterpretationPrompt(BASE_PARAMS)
    expect(prompt).toContain('Promising')
  })

  it('calcula pct en rango 0-100: average=1.0 → pct=0', () => {
    const prompt = buildInterpretationPrompt({ ...BASE_PARAMS, average: 1.0 })
    expect(prompt).toContain('0/100')
  })

  it('calcula pct en rango 0-100: average=2.0 → pct=50', () => {
    const prompt = buildInterpretationPrompt({ ...BASE_PARAMS, average: 2.0 })
    expect(prompt).toContain('50/100')
  })

  it('calcula pct en rango 0-100: average=3.0 → pct=100', () => {
    const prompt = buildInterpretationPrompt({ ...BASE_PARAMS, average: 3.0 })
    expect(prompt).toContain('100/100')
  })

  it('el prompt no empieza con bullet points', () => {
    const prompt = buildInterpretationPrompt(BASE_PARAMS)
    expect(prompt.trimStart()).not.toMatch(/^[-•*]/)
  })
})
