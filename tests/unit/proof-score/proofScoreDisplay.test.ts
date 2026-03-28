/**
 * Tests unitarios — Story 5.2: Proof Score Display & Waiting State
 * Validan la lógica pura de cálculo del estado de espera (remaining feedbacks, progress).
 */

import { describe, it, expect } from 'vitest'

// ─── Lógica pura extraída del componente ProofScoreWaiting ───────────────────

const MIN_FEEDBACKS_FOR_SCORE = 3

function getRemainingFeedbacks(feedbackCount: number): number {
  return Math.max(0, MIN_FEEDBACKS_FOR_SCORE - feedbackCount)
}

function getProgressPercentage(feedbackCount: number): number {
  return (feedbackCount / MIN_FEEDBACKS_FOR_SCORE) * 100
}

function getRemainingLabel(remaining: number): string {
  return `Faltan ${remaining} ${remaining === 1 ? 'feedback' : 'feedbacks'} para tu señal`
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProofScoreWaiting — lógica de estado de espera', () => {
  // Test 1: Con 0 feedbacks, remaining = 3
  it('con 0 feedbacks muestra remaining = 3', () => {
    const remaining = getRemainingFeedbacks(0)
    expect(remaining).toBe(3)
  })

  // Test 2: Con 2 feedbacks, remaining = 1 y usa singular "feedback"
  it('con 2 feedbacks muestra remaining = 1 en singular', () => {
    const remaining = getRemainingFeedbacks(2)
    expect(remaining).toBe(1)

    const label = getRemainingLabel(remaining)
    expect(label).toBe('Faltan 1 feedback para tu señal')
    expect(label).not.toContain('feedbacks')
  })

  // Test 3: Con 1 feedback, progress = 33.33%
  it('con 1 feedback el progreso es 33.33%', () => {
    const progress = getProgressPercentage(1)
    expect(progress).toBeCloseTo(33.33, 1)
  })

  // Test 4: Con 3 feedbacks, progress = 100%
  it('con 3 feedbacks el progreso es 100%', () => {
    const progress = getProgressPercentage(3)
    expect(progress).toBe(100)
  })

  // Test 5 (extra): getRemainingFeedbacks nunca devuelve negativo (más de 3 feedbacks)
  it('con mas de 3 feedbacks remaining no es negativo', () => {
    const remaining = getRemainingFeedbacks(5)
    expect(remaining).toBe(0)
  })

  // Test 6 (extra): Con 0 feedbacks usa plural "feedbacks"
  it('con 0 feedbacks usa plural en el label', () => {
    const remaining = getRemainingFeedbacks(0)
    const label = getRemainingLabel(remaining)
    expect(label).toContain('feedbacks')
    expect(label).toBe('Faltan 3 feedbacks para tu señal')
  })
})
