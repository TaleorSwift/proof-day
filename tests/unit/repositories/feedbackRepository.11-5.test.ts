// Story 11.5 — Tests TDD Outside-In: feedbackRepository.countByReviewerInCommunityRecent
// T4.3 — nuevo método con filtro de fecha

import { describe, it, expect, vi } from 'vitest'
import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'

// ── Mock de Supabase ──────────────────────────────────────────────────────────

function buildSupabaseMock(countResult: { count: number | null; error: unknown }) {
  const gteMock = vi.fn().mockResolvedValue(countResult)
  const eqReviewerMock = vi.fn().mockReturnValue({ gte: gteMock })
  const eqCommunityMock = vi.fn().mockReturnValue({ eq: eqReviewerMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqCommunityMock })
  const fromMock = vi.fn().mockReturnValue({ select: selectMock })

  return {
    from: fromMock,
    _spies: { gteMock, eqReviewerMock, eqCommunityMock, selectMock },
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('feedbackRepository.countByReviewerInCommunityRecent', () => {
  it('devuelve el count de feedbacks dentro del período dado', async () => {
    const supabaseMock = buildSupabaseMock({ count: 3, error: null })
    const repo = createFeedbackRepository(supabaseMock as never)

    const result = await repo.countByReviewerInCommunityRecent(
      'reviewer-123',
      'community-456',
      30,
    )

    expect(result.count).toBe(3)
    expect(result.error).toBeNull()
  })

  it('devuelve count=0 cuando no hay feedbacks en el período', async () => {
    const supabaseMock = buildSupabaseMock({ count: 0, error: null })
    const repo = createFeedbackRepository(supabaseMock as never)

    const result = await repo.countByReviewerInCommunityRecent(
      'reviewer-123',
      'community-456',
      30,
    )

    expect(result.count).toBe(0)
  })

  it('aplica el filtro gte con la fecha calculada correctamente', async () => {
    const supabaseMock = buildSupabaseMock({ count: 2, error: null })
    const repo = createFeedbackRepository(supabaseMock as never)

    const before = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    await repo.countByReviewerInCommunityRecent('reviewer-123', 'community-456', 30)

    const after = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const gteSpy = supabaseMock._spies.gteMock
    expect(gteSpy).toHaveBeenCalledOnce()
    const [field, isoString] = gteSpy.mock.calls[0]
    expect(field).toBe('created_at')
    // El ISO string debe estar dentro del rango esperado (30 días atrás ± 1 segundo)
    const calledDate = new Date(isoString)
    expect(calledDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)
    expect(calledDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000)
  })

  it('filtra por community_id y reviewer_id correctamente', async () => {
    const supabaseMock = buildSupabaseMock({ count: 1, error: null })
    const repo = createFeedbackRepository(supabaseMock as never)

    await repo.countByReviewerInCommunityRecent('reviewer-abc', 'community-xyz', 30)

    const { eqCommunityMock, eqReviewerMock } = supabaseMock._spies
    expect(eqCommunityMock).toHaveBeenCalledWith('community_id', 'community-xyz')
    expect(eqReviewerMock).toHaveBeenCalledWith('reviewer_id', 'reviewer-abc')
  })
})
