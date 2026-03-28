import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Zod schema mirroring the API route validation (Story 5.3).
 * Tests validate the schema logic in isolation — no real API calls.
 */
const decisionSchema = z.object({
  decision: z.enum(['iterate', 'scale', 'abandon']),
})

/** Simulates the 409 guard: returns error if decision is already set */
function checkDecisionConflict(existingDecision: string | null): string | null {
  if (existingDecision !== null) return 'DECISION_ALREADY_REGISTERED'
  return null
}

describe('decisionSchema — validacion de entrada', () => {
  it('acepta "iterate" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'iterate' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.decision).toBe('iterate')
    }
  })

  it('acepta "scale" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'scale' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.decision).toBe('scale')
    }
  })

  it('acepta "abandon" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'abandon' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.decision).toBe('abandon')
    }
  })

  it('rechaza una decision no reconocida — VALIDATION_ERROR', () => {
    const result = decisionSchema.safeParse({ decision: 'delete' })
    expect(result.success).toBe(false)
  })

  it('rechaza body vacio — VALIDATION_ERROR', () => {
    const result = decisionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rechaza decision como numero — VALIDATION_ERROR', () => {
    const result = decisionSchema.safeParse({ decision: 42 })
    expect(result.success).toBe(false)
  })
})

describe('checkDecisionConflict — regla de irreversibilidad', () => {
  it('no hay conflicto si la decision actual es null', () => {
    expect(checkDecisionConflict(null)).toBeNull()
  })

  it('devuelve DECISION_ALREADY_REGISTERED si ya hay una decision', () => {
    expect(checkDecisionConflict('iterate')).toBe('DECISION_ALREADY_REGISTERED')
  })

  it('devuelve DECISION_ALREADY_REGISTERED independientemente del valor previo', () => {
    expect(checkDecisionConflict('scale')).toBe('DECISION_ALREADY_REGISTERED')
    expect(checkDecisionConflict('abandon')).toBe('DECISION_ALREADY_REGISTERED')
  })
})
