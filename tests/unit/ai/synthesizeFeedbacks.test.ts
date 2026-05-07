import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Feedback } from '@/lib/types/feedback'
import type { Project } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Tests — synthesizeFeedbacks (TDD Outside-In)
// Story 12.2 — AC2, AC3
// ---------------------------------------------------------------------------

const MOCK_PROJECT: Project = {
  id: 'project-uuid-001',
  slug: 'pulse-check',
  communityId: 'community-uuid-001',
  builderId: 'user-uuid-001',
  title: 'Pulse Check',
  problem: 'Remote teams struggle to surface burnout.',
  solution: 'A lightweight weekly pulse survey.',
  hypothesis: 'If team leads see mood trends weekly, they will intervene faster.',
  imageUrls: [],
  status: 'live',
  decision: null,
  decidedAt: null,
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
  targetUser: 'Engineering managers',
  demoUrl: null,
  feedbackTopics: ['Problem clarity', 'Willingness to use'],
  tagline: 'Anonymous weekly mood tracking',
  wouldUseCount: 2,
  templateId: null,
  customQuestion: null,
  qualityThreshold: 0.6,
}

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 'fb-uuid-001',
    projectId: 'project-uuid-001',
    reviewerId: 'user-uuid-002',
    communityId: 'community-uuid-001',
    scores: { p1: 3, p2: 2, p3: 3 },
    textResponses: {
      p1: 'El problema es real en mi equipo.',
      p4: 'Añadiría integración con Slack.',
    },
    createdAt: '2026-03-21T09:00:00Z',
    customAnswer: null,
    qualityScore: 0.75,
  },
  {
    id: 'fb-uuid-002',
    projectId: 'project-uuid-001',
    reviewerId: 'user-uuid-003',
    communityId: 'community-uuid-001',
    scores: { p1: 2, p2: 3, p3: 2 },
    textResponses: {
      p2: 'La visualización de tendencias es clave.',
      p4: 'Me parece una herramienta útil.',
    },
    createdAt: '2026-03-21T11:00:00Z',
    customAnswer: null,
    qualityScore: 0.60,
  },
]

const MOCK_OLLAMA_RESPONSE = {
  response: `1) Resumen ejecutivo: El proyecto Pulse Check aborda una necesidad real en equipos distribuidos. Los usuarios valoran la visualización de tendencias. La integración con herramientas existentes es clave.

2) Puntos fuertes:
- Problema claramente identificado
- Visualización de tendencias valorada

3) Áreas de mejora:
- Integración con Slack pendiente
- Anonimato cuestionado

4) Recomendación final: Priorizar la integración con Slack para acelerar la adopción.`,
  eval_count: 180,
  prompt_eval_count: 220,
}

describe('buildPrompt', () => {
  it('incluye el título del proyecto en el prompt', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('Pulse Check')
  })

  it('incluye instrucción de síntesis con el título del proyecto', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('Sintetiza los siguientes feedbacks sobre el proyecto Pulse Check')
  })

  it('incluye instrucción de formato con secciones numeradas', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('Resumen ejecutivo')
    expect(prompt).toContain('Puntos fuertes')
    expect(prompt).toContain('Áreas de mejora')
    expect(prompt).toContain('Recomendación final')
  })

  it('incluye los textos de los feedbacks', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('El problema es real en mi equipo.')
    expect(prompt).toContain('La visualización de tendencias es clave.')
  })

  it('incluye instrucción de idioma español y concisión', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('Responde SOLO en español')
    expect(prompt).toContain('conciso')
  })

  it('incluye todos los text_responses de cada feedback', async () => {
    const { buildPrompt } = await import('@/lib/ai/synthesizeFeedbacks')
    const prompt = buildPrompt(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(prompt).toContain('Añadiría integración con Slack.')
  })
})

describe('parseAIResponse', () => {
  it('extrae summaryText del resumen ejecutivo', async () => {
    const { parseAIResponse } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = parseAIResponse(MOCK_OLLAMA_RESPONSE.response)

    expect(result.summaryText).toBeTruthy()
    expect(typeof result.summaryText).toBe('string')
  })

  it('retorna keyInsights como array no vacío', async () => {
    const { parseAIResponse } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = parseAIResponse(MOCK_OLLAMA_RESPONSE.response)

    expect(Array.isArray(result.keyInsights)).toBe(true)
    expect(result.keyInsights.length).toBeGreaterThan(0)
  })

  it('maneja respuesta vacía sin lanzar error', async () => {
    const { parseAIResponse } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = parseAIResponse('')

    expect(result.summaryText).toBe('')
    expect(Array.isArray(result.keyInsights)).toBe(true)
  })
})

describe('synthesizeFeedbacks', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('OLLAMA_BASE_URL', 'http://localhost:11434')
    vi.stubEnv('OLLAMA_MODEL', 'qwen2.5:3b')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('retorna AISynthesisResult con todos los campos cuando Ollama responde', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { synthesizeFeedbacks } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = await synthesizeFeedbacks(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(result).toMatchObject({
      summaryText: expect.any(String),
      keyInsights: expect.any(Array),
      model: 'qwen2.5:3b',
      tokensInput: 220,
      tokensOutput: 180,
      costUsd: 0.0,
    })
  })

  it('costUsd siempre es 0.0 para Ollama local', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { synthesizeFeedbacks } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = await synthesizeFeedbacks(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(result.costUsd).toBe(0.0)
  })

  it('lanza error cuando Ollama no está disponible (error de red)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('fetch failed'))

    const { synthesizeFeedbacks } = await import('@/lib/ai/synthesizeFeedbacks')

    await expect(
      synthesizeFeedbacks(MOCK_FEEDBACKS, MOCK_PROJECT)
    ).rejects.toThrow()
  })

  it('lanza error cuando la respuesta HTTP no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as Response)

    const { synthesizeFeedbacks } = await import('@/lib/ai/synthesizeFeedbacks')

    await expect(
      synthesizeFeedbacks(MOCK_FEEDBACKS, MOCK_PROJECT)
    ).rejects.toThrow()
  })

  it('usa el model de OLLAMA_MODEL en el resultado', async () => {
    vi.resetModules()
    vi.stubEnv('OLLAMA_MODEL', 'llama3.2:3b')

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...MOCK_OLLAMA_RESPONSE }),
    } as Response)

    const { synthesizeFeedbacks } = await import('@/lib/ai/synthesizeFeedbacks')
    const result = await synthesizeFeedbacks(MOCK_FEEDBACKS, MOCK_PROJECT)

    expect(result.model).toBe('llama3.2:3b')
  })
})
