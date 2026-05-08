// Story 13.7 — Tests de POST /api/ai/suggest-project-field
// TDD Outside-In: tests escritos ANTES de la implementación
//
// Comportamientos cubiertos:
//   - 401 sin token de sesión
//   - 400 campo inválido → INVALID_FIELD
//   - 429 budget agotado → BUDGET_EXCEEDED
//   - 503 Ollama falla → AI_UNAVAILABLE
//   - 200 mock Ollama retorna texto → { suggestion: "..." }

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — hoisted para que las variables estén disponibles en factory
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  mockCreateClient,
  mockCheckDailyBudget,
  mockGenerate,
  mockGetOllamaClient,
  mockTrackCost,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockCreateClient = vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    from: vi.fn(),
  })
  const mockGenerate = vi.fn()
  const mockGetOllamaClient = vi.fn().mockReturnValue({ generate: mockGenerate })
  const mockCheckDailyBudget = vi.fn()
  const mockTrackCost = vi.fn()
  return {
    mockGetUser,
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
// Import handler bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/ai/suggest-project-field/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER_ID = 'user-uuid-001'
const MOCK_USER = { id: USER_ID, email: 'user@example.com' }

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/ai/suggest-project-field', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('POST /api/ai/suggest-project-field', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_AI_ENABLED', 'true')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const req = makeRequest({ field: 'problem', title: 'Mi proyecto' })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('retorna 400 con INVALID_FIELD cuando field no es válido', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(true)

    const req = makeRequest({ field: 'invalid', title: 'Mi proyecto' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('INVALID_FIELD')
  })

  it('retorna 400 con TITLE_REQUIRED cuando title está ausente', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const req = makeRequest({ field: 'problem' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('TITLE_REQUIRED')
  })

  it('retorna 400 con TITLE_REQUIRED cuando title es una cadena vacía', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const req = makeRequest({ field: 'problem', title: '' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('TITLE_REQUIRED')
  })

  it('retorna 400 con TITLE_REQUIRED cuando title es solo espacios en blanco', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const req = makeRequest({ field: 'problem', title: '   ' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('TITLE_REQUIRED')
  })

  it('retorna 429 con BUDGET_EXCEEDED cuando el presupuesto está agotado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(false)

    const req = makeRequest({ field: 'problem', title: 'Mi proyecto' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(429)
    expect(body.error).toBe('BUDGET_EXCEEDED')
  })

  it('retorna 503 con AI_UNAVAILABLE cuando Ollama falla', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(true)
    mockGenerate.mockRejectedValue(new Error('Ollama connection refused'))

    const req = makeRequest({ field: 'problem', title: 'Mi proyecto' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.error).toBe('AI_UNAVAILABLE')
  })

  it('retorna 200 con suggestion cuando Ollama responde correctamente', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(true)
    mockGenerate.mockResolvedValue({
      response: 'Muchos emprendedores no saben cómo formular sus ideas de negocio.',
      eval_count: 20,
      prompt_eval_count: 50,
    })
    mockTrackCost.mockResolvedValue(undefined)

    const req = makeRequest({ field: 'problem', title: 'Mi proyecto' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestion).toBe('Muchos emprendedores no saben cómo formular sus ideas de negocio.')
  })

  it('llama a trackCost después de generar la sugerencia', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(true)
    mockGenerate.mockResolvedValue({
      response: 'Sugerencia generada.',
      eval_count: 10,
      prompt_eval_count: 30,
    })
    mockTrackCost.mockResolvedValue(undefined)

    const req = makeRequest({ field: 'solution', title: 'Mi proyecto', problem: 'El problema' })
    await POST(req)

    expect(mockTrackCost).toHaveBeenCalledOnce()
    const callArg = mockTrackCost.mock.calls[0][0]
    expect(callArg).toHaveProperty('tokensInput')
    expect(callArg).toHaveProperty('tokensOutput')
    expect(callArg).toHaveProperty('costUsd', 0)
  })

  it('pasa el contexto correcto al prompt para el campo hypothesis', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    mockCheckDailyBudget.mockResolvedValue(true)
    mockGenerate.mockResolvedValue({
      response: 'Creemos que ...',
      eval_count: 15,
      prompt_eval_count: 40,
    })
    mockTrackCost.mockResolvedValue(undefined)

    const req = makeRequest({
      field: 'hypothesis',
      title: 'Mi proyecto',
      problem: 'El problema',
      solution: 'La solución',
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.suggestion).toBe('Creemos que ...')
    // Verificar que generate fue llamado con un prompt que contiene el contexto
    const promptArg = mockGenerate.mock.calls[0][0]
    expect(promptArg).toContain('Mi proyecto')
    expect(promptArg).toContain('El problema')
    expect(promptArg).toContain('La solución')
  })
})
