/**
 * Tests unitarios — Story 5.2: Proof Score Display & Waiting State
 * Validan la lógica pura de cálculo del estado de espera (remaining feedbacks, progress).
 */

import { describe, it, expect } from 'vitest'
import {
  MIN_FEEDBACKS_FOR_SCORE,
  getRemainingFeedbacks,
  getProgressPercentage,
  getRemainingLabel,
} from '@/lib/utils/proof-score'

describe('ProofScoreWaiting — lógica de estado de espera', () => {
  it('con 0 feedbacks muestra remaining = 3', () => {
    expect(getRemainingFeedbacks(0)).toBe(MIN_FEEDBACKS_FOR_SCORE)
  })

  it('con 2 feedbacks muestra remaining = 1 en singular', () => {
    const remaining = getRemainingFeedbacks(2)
    expect(remaining).toBe(1)

    const label = getRemainingLabel(remaining)
    expect(label).toBe('Faltan 1 feedback para tu señal')
    expect(label).not.toContain('feedbacks')
  })

  it('con 1 feedback el progreso es 33.33%', () => {
    expect(getProgressPercentage(1)).toBeCloseTo(33.33, 1)
  })

  it('con 3 feedbacks el progreso es 100%', () => {
    expect(getProgressPercentage(MIN_FEEDBACKS_FOR_SCORE)).toBe(100)
  })

  it('con mas de 3 feedbacks remaining no es negativo', () => {
    expect(getRemainingFeedbacks(5)).toBe(0)
  })

  it('con 0 feedbacks usa plural en el label', () => {
    const remaining = getRemainingFeedbacks(0)
    const label = getRemainingLabel(remaining)
    expect(label).toContain('feedbacks')
    expect(label).toBe('Faltan 3 feedbacks para tu señal')
  })
})
