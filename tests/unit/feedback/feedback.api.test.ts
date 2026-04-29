import { describe, it, expect, vi, afterEach } from 'vitest'
import { submitFeedback, getFeedbacks } from '@/lib/api/feedback'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_SUBMIT_INPUT = {
  projectId: 'project-uuid-001',
  communityId: 'community-uuid-001',
  scores: { p1: 3, p2: 2, p3: 1 } as Record<string, number>,
  textResponses: { p4: 'Muy útil' } as Record<string, string>,
}

const MOCK_FEEDBACK = {
  id: 'feedback-uuid-001',
  projectId: 'project-uuid-001',
  reviewerId: 'user-uuid-001',
  communityId: 'community-uuid-001',
  scores: { p1: 3, p2: 2, p3: 1 },
  textResponses: { p4: 'Muy útil' },
  createdAt: '2024-01-01T00:00:00Z',
}

const MOCK_FEEDBACK_WITH_REVIEWER = {
  id: 'feedback-uuid-001',
  text_responses: { p4: 'Muy útil' },
  created_at: '2024-01-01T00:00:00Z',
  profiles: { id: 'user-uuid-001', name: 'Ana García', avatar_url: null },
}

// ---------------------------------------------------------------------------
// Suite: submitFeedback
// ---------------------------------------------------------------------------

describe('submitFeedback', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/feedback con Content-Type JSON', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_FEEDBACK }),
    } as Response)

    await submitFeedback(VALID_SUBMIT_INPUT as Parameters<typeof submitFeedback>[0])

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/feedback',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('serializa el body correctamente', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_FEEDBACK }),
    } as Response)

    await submitFeedback(VALID_SUBMIT_INPUT as Parameters<typeof submitFeedback>[0])

    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual(VALID_SUBMIT_INPUT)
  })

  it('retorna el feedback creado cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_FEEDBACK }),
    } as Response)

    const result = await submitFeedback(VALID_SUBMIT_INPUT as Parameters<typeof submitFeedback>[0])

    expect(result).toEqual(MOCK_FEEDBACK)
  })

  it('lanza Error con el mensaje del servidor cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Ya has enviado feedback para este proyecto' }),
    } as Response)

    await expect(
      submitFeedback(VALID_SUBMIT_INPUT as Parameters<typeof submitFeedback>[0])
    ).rejects.toThrow('Ya has enviado feedback para este proyecto')
  })
})

// ---------------------------------------------------------------------------
// Suite: getFeedbacks
// ---------------------------------------------------------------------------

describe('getFeedbacks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a GET /api/feedback con el projectId como query param', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [MOCK_FEEDBACK_WITH_REVIEWER] }),
    } as Response)

    await getFeedbacks('project-uuid-001')

    expect(fetchSpy).toHaveBeenCalledWith('/api/feedback?projectId=project-uuid-001')
  })

  it('retorna el array de feedbacks cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [MOCK_FEEDBACK_WITH_REVIEWER] }),
    } as Response)

    const result = await getFeedbacks('project-uuid-001')

    expect(result).toEqual([MOCK_FEEDBACK_WITH_REVIEWER])
  })

  it('retorna array vacío cuando no hay feedbacks', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response)

    const result = await getFeedbacks('project-uuid-001')

    expect(result).toEqual([])
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Acceso denegado' }),
    } as Response)

    await expect(getFeedbacks('project-uuid-001')).rejects.toThrow('Acceso denegado')
  })
})
