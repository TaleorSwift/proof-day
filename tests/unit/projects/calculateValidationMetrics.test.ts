import { describe, it, expect } from 'vitest'
import { calculateValidationMetrics } from '@/lib/projects/calculateValidationMetrics'

describe('calculateValidationMetrics', () => {
  it('devuelve ceros cuando feedbackCount es 0', () => {
    const result = calculateValidationMetrics([], 0)
    expect(result).toEqual({ understandPercent: 0, wouldUsePercent: 0 })
  })

  it('ignora el array cuando feedbackCount es 0 aunque haya entradas', () => {
    const feedbacks = [{ scores: { p1: 3, p2: 3 } }]
    const result = calculateValidationMetrics(feedbacks, 0)
    expect(result).toEqual({ understandPercent: 0, wouldUsePercent: 0 })
  })

  it('calcula understandPercent: score p1 >= 2 cuenta como "entiende"', () => {
    const feedbacks = [
      { scores: { p1: 2, p2: 1 } }, // entiende, no usaría
      { scores: { p1: 3, p2: 1 } }, // entiende, no usaría
      { scores: { p1: 1, p2: 1 } }, // no entiende
    ]
    const result = calculateValidationMetrics(feedbacks, 3)
    expect(result.understandPercent).toBe(67) // Math.round(2/3*100)
  })

  it('calcula wouldUsePercent: score p2 === 3 cuenta como "usaría"', () => {
    const feedbacks = [
      { scores: { p1: 1, p2: 3 } }, // usaría
      { scores: { p1: 1, p2: 2 } }, // no usaría (p2 !== 3)
      { scores: { p1: 1, p2: 1 } }, // no usaría
    ]
    const result = calculateValidationMetrics(feedbacks, 3)
    expect(result.wouldUsePercent).toBe(33) // Math.round(1/3*100)
  })

  it('devuelve 100% cuando todos entienden y usarían', () => {
    const feedbacks = [
      { scores: { p1: 3, p2: 3 } },
      { scores: { p1: 2, p2: 3 } },
    ]
    const result = calculateValidationMetrics(feedbacks, 2)
    expect(result).toEqual({ understandPercent: 100, wouldUsePercent: 100 })
  })

  it('maneja scores nulos (p1 ausente = 0, no cuenta)', () => {
    const feedbacks = [
      { scores: null },
      { scores: { p1: 3, p2: 3 } },
    ]
    const result = calculateValidationMetrics(feedbacks, 2)
    expect(result.understandPercent).toBe(50) // solo 1 de 2 tiene p1 >= 2
    expect(result.wouldUsePercent).toBe(50)
  })

  it('redondea al entero más cercano', () => {
    const feedbacks = [
      { scores: { p1: 3, p2: 3 } }, // entiende y usaría
      { scores: { p1: 1, p2: 1 } }, // no
      { scores: { p1: 1, p2: 1 } }, // no
    ]
    const result = calculateValidationMetrics(feedbacks, 3)
    // 1/3 = 0.333... → round → 33
    expect(result.understandPercent).toBe(33)
    expect(result.wouldUsePercent).toBe(33)
  })
})
