/**
 * Tests unitarios — Story 5.1: Proof Score Calculation Algorithm
 * Validan la función pura calculateProofScore sin side effects ni dependencias externas.
 *
 * Algoritmo:
 *   average = sum(all p1+p2+p3) / (n_feedbacks × 3)
 *   >= 2.5       → Promising
 *   1.75 - 2.49  → Needs iteration
 *   < 1.75       → Weak
 *   < 3 feedbacks → null
 */

import { describe, it, expect } from 'vitest'
import { calculateProofScore } from '@/lib/utils/proof-score'

// Helpers
const feedback = (p1: number, p2: number, p3: number) => ({ scores: { p1, p2, p3 } })

describe('calculateProofScore — algoritmo Proof Score', () => {
  // Test 1: sin feedbacks → null (AC-1)
  it('retorna null con 0 feedbacks', () => {
    expect(calculateProofScore([])).toBeNull()
  })

  // Test 2: menos de 3 feedbacks → null (AC-1)
  it('retorna null con 2 feedbacks (< MIN_FEEDBACKS = 3)', () => {
    const feedbacks = [feedback(3, 3, 3), feedback(2, 2, 2)]
    expect(calculateProofScore(feedbacks)).toBeNull()
  })

  // Test 3: 1 feedback → null
  it('retorna null con 1 feedback', () => {
    expect(calculateProofScore([feedback(3, 3, 3)])).toBeNull()
  })

  // Test 4: exactamente 3 feedbacks — mínimo válido (AC-5)
  it('calcula con exactamente 3 feedbacks (minimo valido)', () => {
    // 3 feedbacks, todos (3,3,3) → average = 3.0 → Promising
    const feedbacks = [feedback(3, 3, 3), feedback(3, 3, 3), feedback(3, 3, 3)]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.feedbackCount).toBe(3)
  })

  // Test 5: todos Yes (3,3,3) → Promising (AC-2, AC-5)
  it('calcula Promising con todos Yes (3,3,3)', () => {
    const feedbacks = [
      feedback(3, 3, 3),
      feedback(3, 3, 3),
      feedback(3, 3, 3),
    ]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Promising')
    expect(result!.average).toBe(3)
    expect(result!.feedbackCount).toBe(3)
  })

  // Test 6: todos No (1,1,1) → Weak (AC-2, AC-5)
  it('calcula Weak con todos No (1,1,1)', () => {
    const feedbacks = [
      feedback(1, 1, 1),
      feedback(1, 1, 1),
      feedback(1, 1, 1),
    ]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Weak')
    expect(result!.average).toBe(1)
    expect(result!.feedbackCount).toBe(3)
  })

  // Test 7: scores mixtos → Needs iteration (AC-5)
  // F1: (2,2,2)=6, F2: (2,2,2)=6, F3: (2,2,2)=6 → total=18 / 9 = 2.0 → Needs iteration
  it('calcula Needs iteration con scores medios (~2.0)', () => {
    const feedbacks = [
      feedback(2, 2, 2),
      feedback(2, 2, 2),
      feedback(2, 2, 2),
    ]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Needs iteration')
    expect(result!.average).toBe(2)
  })

  // Test 8: borde de threshold 2.5 → Promising (AC-5)
  // 3 feedbacks con (3,2,3)+(3,2,3)+(2,2,3) → 8+8+7=23 / 9 = 2.556 → Promising
  it('calcula Promising en el borde superior del threshold (>= 2.5)', () => {
    const feedbacks = [
      feedback(3, 2, 3),
      feedback(3, 2, 3),
      feedback(2, 3, 3),
    ]
    // total = 8+8+8 = 24 / 9 = 2.667 → Promising
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Promising')
    expect(result!.average).toBeGreaterThanOrEqual(2.5)
  })

  // Test 9: borde inferior de Needs iteration — exactamente 1.75 → Needs iteration
  // Necesitamos average = 1.75: total = 1.75 * 9 = 15.75 — no entero exacto
  // Usamos 4 feedbacks: (1,2,1)+(2,1,2)+(1,2,1)+(2,2,2) = 4+5+4+6 = 19 / 12 = 1.583 → Weak
  // Ajuste: 3 feedbacks (2,1,2)+(2,2,1)+(2,1,2) = 5+5+5=15 / 9 = 1.667 → Weak
  // Para threshold exacto 1.75: 3 feedbacks → 1.75*9=15.75 — imposible con enteros
  // Usamos 4 feedbacks (2,2,1)+(2,1,1)+(2,2,2)+(1,1,2) = 5+4+6+4=19 / 12 = 1.583... Weak
  // Mejor: score 1.75 con (2,2,1)+(2,1,2)+(2,2,1)+(1,2,2) = 5+5+5+5=20/12=1.667 → Weak
  // Para Needs iteration border: 3 feedbacks (2,1,2)+(3,1,1)+(2,2,2)=5+5+6=16/9=1.78 → Needs iteration
  it('calcula Needs iteration en el borde inferior del threshold (>= 1.75)', () => {
    const feedbacks = [
      feedback(2, 1, 2), // 5
      feedback(3, 1, 1), // 5
      feedback(2, 2, 2), // 6
    ]
    // total = 16 / 9 = 1.777... → Needs iteration
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Needs iteration')
    expect(result!.average).toBeGreaterThanOrEqual(1.75)
    expect(result!.average).toBeLessThan(2.5)
  })

  // Test 10: ejemplo del Dev Note (AC-2)
  // F1: p1=3,p2=2,p3=3=8, F2: p1=2,p2=3,p3=2=7, F3: p1=3,p2=3,p3=3=9 → 24/9=2.67 → Promising
  it('replica el ejemplo del Dev Note: 24pts / 9 respuestas = 2.67 → Promising', () => {
    const feedbacks = [
      feedback(3, 2, 3),
      feedback(2, 3, 2),
      feedback(3, 3, 3),
    ]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('Promising')
    expect(result!.average).toBe(2.67)
    expect(result!.feedbackCount).toBe(3)
  })

  // Test 11: redondeo a 2 decimales (AC-2)
  it('redondea el average a 2 decimales', () => {
    // 3 feedbacks (2,1,2)+(3,1,1)+(2,2,2) = 5+5+6=16/9 = 1.7777... → round → 1.78
    const feedbacks = [
      feedback(2, 1, 2),
      feedback(3, 1, 1),
      feedback(2, 2, 2),
    ]
    const result = calculateProofScore(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.average).toBe(1.78)
  })
})
