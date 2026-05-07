// Story 12.7 — Tests del trigger automático de síntesis IA en POST /api/feedback
// TDD Outside-In
//
// Comportamientos cubiertos:
//   - Feedback que lleva conteo a exactamente 3 → triggerSynthesisWebhook llamado
//   - Feedback que es el 4to (conteo = 4) → webhook NO llamado
//   - Feedback con conteo < 3 → webhook NO llamado
//   - Fire-and-forget: el POST retorna 201 sin esperar al fetch del webhook

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — hoisted para que las variables estén disponibles en factory
// ---------------------------------------------------------------------------

const {
  mockGetUser,
  mockCreateClient,
  mockValidateEligibility,
  mockCreate,
  mockCountCompleteByProject,
  mockTrigger,
  mockCalculateQualityScore,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockCreateClient = vi.fn()
  const mockValidateEligibility = vi.fn()
  const mockCreate = vi.fn()
  const mockCountCompleteByProject = vi.fn()
  const mockTrigger = vi.fn()
  const mockCalculateQualityScore = vi.fn().mockReturnValue(0.8)
  return {
    mockGetUser,
    mockCreateClient,
    mockValidateEligibility,
    mockCreate,
    mockCountCompleteByProject,
    mockTrigger,
    mockCalculateQualityScore,
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/services/feedback.service', () => ({
  createFeedbackService: vi.fn().mockReturnValue({
    validateEligibility: mockValidateEligibility,
  }),
}))

vi.mock('@/lib/repositories/feedback.repository', () => ({
  createFeedbackRepository: vi.fn().mockReturnValue({
    create: mockCreate,
    countCompleteByProject: mockCountCompleteByProject,
  }),
}))

vi.mock('@/lib/repositories/projects.repository', () => ({
  createProjectsRepository: vi.fn().mockReturnValue({
    findById: vi.fn(),
  }),
}))

vi.mock('@/lib/ai/triggerSynthesisWebhook', () => ({
  triggerSynthesisWebhook: mockTrigger,
}))

vi.mock('@/lib/utils/feedbackQuality', () => ({
  calculateQualityScore: mockCalculateQualityScore,
}))

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------

const PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000'
const COMMUNITY_ID = '550e8400-e29b-41d4-a716-446655440001'

const FEEDBACK_BODY = {
  projectId: PROJECT_ID,
  communityId: COMMUNITY_ID,
  scores: { p1: 3, p2: 3, p3: 3 },
  textResponses: {
    p1: 'Good feedback text',
    p2: 'Very good indeed',
    p3: 'Excellent product',
    p4: 'I would definitely recommend this product to others.',
  },
}

const FEEDBACK_ROW = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  projectId: PROJECT_ID,
  reviewerId: 'user-reviewer',
  communityId: COMMUNITY_ID,
  scores: { p1: 3, p2: 3, p3: 3 },
  textResponses: {
    p1: 'Good feedback text',
    p2: 'Very good indeed',
    p3: 'Excellent product',
    p4: 'I would definitely recommend this product to others.',
  },
  createdAt: '2026-01-01',
  customAnswer: null,
  qualityScore: 0.8,
}

// ---------------------------------------------------------------------------
// Import del handler bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/feedback/route'

// ---------------------------------------------------------------------------
// Setup común
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
  vi.stubEnv('WEBHOOK_SECRET', 'test-secret')

  // Auth — usuario autenticado por defecto
  mockCreateClient.mockResolvedValue({
    auth: { getUser: mockGetUser },
  })
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-reviewer' } }, error: null })

  // Eligibility OK por defecto
  mockValidateEligibility.mockResolvedValue({ eligible: true })

  // Create feedback exitoso por defecto
  mockCreate.mockResolvedValue({ data: FEEDBACK_ROW, error: null })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/feedback — trigger síntesis IA (Story 12.7)', () => {
  it('llama a triggerSynthesisWebhook cuando el conteo de feedbacks completos llega a exactamente 3', async () => {
    mockCountCompleteByProject.mockResolvedValue(3)

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify(FEEDBACK_BODY),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockTrigger).toHaveBeenCalledOnce()
    expect(mockTrigger).toHaveBeenCalledWith(PROJECT_ID)
  })

  it('NO llama a triggerSynthesisWebhook cuando el conteo es 4 (ya superado)', async () => {
    mockCountCompleteByProject.mockResolvedValue(4)

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify(FEEDBACK_BODY),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockTrigger).not.toHaveBeenCalled()
  })

  it('NO llama a triggerSynthesisWebhook cuando el conteo es menor que 3', async () => {
    mockCountCompleteByProject.mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify(FEEDBACK_BODY),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockTrigger).not.toHaveBeenCalled()
  })

  it('retorna 201 sin esperar al fetch del webhook (fire-and-forget)', async () => {
    mockCountCompleteByProject.mockResolvedValue(3)

    // Simulamos que el trigger inicia un fetch que nunca resuelve
    // La route NO hace await del trigger → la respuesta llega inmediatamente
    mockTrigger.mockImplementation(() => {
      void new Promise(() => {}) // promesa que nunca resuelve
      return undefined // retorna void inmediatamente
    })

    const start = Date.now()

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify(FEEDBACK_BODY),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const elapsed = Date.now() - start

    expect(response.status).toBe(201)
    // La respuesta llega en menos de 1 segundo (no espera al fetch del webhook)
    expect(elapsed).toBeLessThan(1000)
  })
})
