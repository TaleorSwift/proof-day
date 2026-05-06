/**
 * Unit tests — feedbackFromRow (Story 11.1)
 * Verifica el mapeo correcto de custom_answer y quality_score desde DB row a dominio
 * TDD Outside-In: escritos antes de la implementación
 */

import { describe, it, expect } from 'vitest'
import { feedbackFromRow } from '@/lib/types/feedback'
import type { FeedbackRow } from '@/lib/types/feedback'

const BASE_ROW: FeedbackRow = {
  id: 'fb-1',
  project_id: 'proj-1',
  reviewer_id: 'user-1',
  community_id: 'comm-1',
  scores: { p1: 3, p2: 2, p3: 1 },
  text_responses: { p4: 'Buen proyecto, necesita más foco.' },
  created_at: '2026-01-01T00:00:00Z',
  custom_answer: null,
  quality_score: null,
}

describe('feedbackFromRow — Story 11.1: custom_answer y quality_score', () => {
  it('mapea custom_answer null correctamente', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, custom_answer: null })
    expect(feedback.customAnswer).toBeNull()
  })

  it('mapea custom_answer con valor string correctamente', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, custom_answer: 'Me parece muy útil para startups.' })
    expect(feedback.customAnswer).toBe('Me parece muy útil para startups.')
  })

  it('mapea quality_score null correctamente', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, quality_score: null })
    expect(feedback.qualityScore).toBeNull()
  })

  it('mapea quality_score con valor numérico correctamente', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, quality_score: 0.85 })
    expect(feedback.qualityScore).toBe(0.85)
  })

  it('mapea quality_score 0 correctamente', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, quality_score: 0 })
    expect(feedback.qualityScore).toBe(0)
  })

  it('preserva campos previos (scores, textResponses, ids) al añadir nuevos campos', () => {
    const feedback = feedbackFromRow({
      ...BASE_ROW,
      scores: { p1: 3, p2: 3, p3: 3 },
      text_responses: { p1: 'Muy claro', p4: 'Excelente idea.' },
      custom_answer: 'Respuesta personalizada',
      quality_score: 0.92,
    })
    expect(feedback.scores).toEqual({ p1: 3, p2: 3, p3: 3 })
    expect(feedback.textResponses).toEqual({ p1: 'Muy claro', p4: 'Excelente idea.' })
    expect(feedback.customAnswer).toBe('Respuesta personalizada')
    expect(feedback.qualityScore).toBe(0.92)
    expect(feedback.id).toBe('fb-1')
    expect(feedback.projectId).toBe('proj-1')
    expect(feedback.reviewerId).toBe('user-1')
    expect(feedback.communityId).toBe('comm-1')
  })

  it('mapea createdAt desde created_at (snake_case → camelCase)', () => {
    const feedback = feedbackFromRow({ ...BASE_ROW, created_at: '2026-03-15T10:00:00Z' })
    expect(feedback.createdAt).toBe('2026-03-15T10:00:00Z')
  })
})
