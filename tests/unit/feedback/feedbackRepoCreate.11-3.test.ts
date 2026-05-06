import { describe, it, expect, vi } from 'vitest'

// ---------------------------------------------------------------------------
// T3 — TDD Outside-In: feedbackRepo.create persiste qualityScore (Story 11.3, AC-3)
// ---------------------------------------------------------------------------

const supabaseMock = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'

const MOCK_FEEDBACK_ROW = {
  id: 'fb-001',
  project_id: 'proj-001',
  reviewer_id: 'user-001',
  community_id: 'comm-001',
  scores: { p1: 3, p2: 2, p3: 1 },
  text_responses: { p4: 'Texto largo de feedback con detalles.' },
  created_at: '2026-01-01T00:00:00Z',
  custom_answer: null,
  quality_score: 0.75,
}

describe('feedbackRepo.create — qualityScore (Story 11.3, AC-3)', () => {
  // T3.1 — create con qualityScore: 0.75 → insert incluye quality_score: 0.75
  it('incluye quality_score en el insert cuando se proporciona qualityScore', async () => {
    const insertSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACK_ROW, error: null }),
      }),
    })

    supabaseMock.from.mockReturnValue({ insert: insertSpy })

    const repo = createFeedbackRepository(supabaseMock as never)

    await repo.create({
      projectId: 'proj-001',
      reviewerId: 'user-001',
      communityId: 'comm-001',
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: { p4: 'Texto largo de feedback con detalles.' },
      qualityScore: 0.75,
    })

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        quality_score: 0.75,
      })
    )
  })

  it('mapea correctamente quality_score del row devuelto a qualityScore en la entidad', async () => {
    const insertSpy = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: MOCK_FEEDBACK_ROW, error: null }),
      }),
    })

    supabaseMock.from.mockReturnValue({ insert: insertSpy })

    const repo = createFeedbackRepository(supabaseMock as never)

    const { data: feedback } = await repo.create({
      projectId: 'proj-001',
      reviewerId: 'user-001',
      communityId: 'comm-001',
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: { p4: 'Texto largo de feedback con detalles.' },
      qualityScore: 0.75,
    })

    expect(feedback?.qualityScore).toBe(0.75)
  })
})
