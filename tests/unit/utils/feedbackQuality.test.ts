import { describe, it, expect } from 'vitest'
import { calculateQualityScore, TARGET_CHARS } from '@/lib/utils/feedbackQuality'

// ---------------------------------------------------------------------------
// T1 — TDD Outside-In: función pura calculateQualityScore (Story 11.3, AC-1)
// ---------------------------------------------------------------------------

describe('TARGET_CHARS', () => {
  it('es igual a 200', () => {
    expect(TARGET_CHARS).toBe(200)
  })
})

describe('calculateQualityScore', () => {
  // T1.2 — objeto vacío → 0.0
  it('devuelve 0.0 cuando textResponses es un objeto vacío {}', () => {
    expect(calculateQualityScore({})).toBe(0.0)
  })

  // T1.3 — 100 caracteres en un campo → 0.5
  it('devuelve 0.5 cuando el total de caracteres es 100', () => {
    expect(calculateQualityScore({ p4: 'a'.repeat(100) })).toBe(0.5)
  })

  // T1.4 — exactamente 200 caracteres → 1.0
  it('devuelve 1.0 cuando el total de caracteres es exactamente 200', () => {
    expect(calculateQualityScore({ p4: 'a'.repeat(200) })).toBe(1.0)
  })

  // T1.5 — más de 200 caracteres → 1.0 (capped)
  it('devuelve 1.0 (capped) cuando el total supera 200 caracteres', () => {
    expect(calculateQualityScore({ p4: 'a'.repeat(300) })).toBe(1.0)
  })

  // T1.6 — múltiples campos suman sus longitudes
  it('suma las longitudes de todos los campos del objeto', () => {
    // 80 + 60 + 60 = 200 → score = 1.0
    expect(
      calculateQualityScore({
        p1: 'a'.repeat(80),
        p2: 'b'.repeat(60),
        p4: 'c'.repeat(60),
      })
    ).toBe(1.0)

    // 50 + 50 = 100 → score = 0.5
    expect(
      calculateQualityScore({
        p1: 'a'.repeat(50),
        p4: 'b'.repeat(50),
      })
    ).toBe(0.5)
  })

  // T1.7 — siempre devuelve un número en [0.0, 1.0]
  it('siempre devuelve un número en el rango [0.0, 1.0]', () => {
    const cases: Record<string, string>[] = [
      {},
      { p4: '' },
      { p4: 'a'.repeat(1) },
      { p4: 'a'.repeat(99) },
      { p4: 'a'.repeat(200) },
      { p4: 'a'.repeat(500) },
      { p1: 'x'.repeat(300), p2: 'y'.repeat(300), p4: 'z'.repeat(300) },
    ]

    for (const textResponses of cases) {
      const score = calculateQualityScore(textResponses)
      expect(score).toBeGreaterThanOrEqual(0.0)
      expect(score).toBeLessThanOrEqual(1.0)
    }
  })
})
