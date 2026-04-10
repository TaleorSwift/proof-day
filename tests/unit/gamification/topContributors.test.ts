/**
 * Tests unitarios — Story 8.6: calculateTopContributors (función pura)
 * Sin mocks de Supabase — validan solo la lógica de agrupación y ordenación.
 */

import { describe, it, expect } from 'vitest'
import { calculateTopContributors, type FeedbackRow } from '@/lib/utils/gamification'

function fb(reviewerId: string, createdAt = '2026-01-01T00:00:00Z'): FeedbackRow {
  return { reviewer_id: reviewerId, created_at: createdAt }
}

describe('calculateTopContributors — lógica de agrupación y ranking', () => {
  it('retorna array vacío cuando feedbacks es array vacío', () => {
    expect(calculateTopContributors([])).toEqual([])
  })

  it('retorna hasta 5 revisores ordenados por feedbackCount desc', () => {
    const feedbacks: FeedbackRow[] = [
      fb('user-1'), fb('user-1'), fb('user-1'), // 3
      fb('user-2'), fb('user-2'),               // 2
      fb('user-3'),                              // 1
      fb('user-4'), fb('user-4'), fb('user-4'), fb('user-4'), // 4
      fb('user-5'),                              // 1
      fb('user-6'), fb('user-6'),               // 2
    ]
    const result = calculateTopContributors(feedbacks)
    expect(result).toHaveLength(5)
    expect(result[0].userId).toBe('user-4')
    expect(result[0].feedbackCount).toBe(4)
    expect(result[1].userId).toBe('user-1')
    expect(result[1].feedbackCount).toBe(3)
  })

  it('limita al limit especificado', () => {
    const feedbacks: FeedbackRow[] = [
      fb('user-1'), fb('user-2'), fb('user-3'), fb('user-4'),
    ]
    const result = calculateTopContributors(feedbacks, 2)
    expect(result).toHaveLength(2)
  })

  it('con un solo revisor retorna array de 1 elemento', () => {
    const feedbacks: FeedbackRow[] = [fb('user-1'), fb('user-1'), fb('user-1')]
    const result = calculateTopContributors(feedbacks)
    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe('user-1')
    expect(result[0].feedbackCount).toBe(3)
  })

  it('cuando hay menos revisores que el limit, retorna todos sin rellenar', () => {
    const feedbacks: FeedbackRow[] = [fb('user-1'), fb('user-2')]
    const result = calculateTopContributors(feedbacks, 5)
    expect(result).toHaveLength(2)
  })

  it('el primer elemento es siempre el que tiene más feedbacks', () => {
    const feedbacks: FeedbackRow[] = [
      fb('user-a'),
      fb('user-b'), fb('user-b'), fb('user-b'),
      fb('user-c'), fb('user-c'),
    ]
    const result = calculateTopContributors(feedbacks)
    expect(result[0].userId).toBe('user-b')
    expect(result[0].feedbackCount).toBe(3)
  })
})
