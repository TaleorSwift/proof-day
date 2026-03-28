import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const decisionSchema = z.object({
  decision: z.enum(['iterate', 'scale', 'abandon']),
})

function checkDecisionConflict(existingDecision: string | null): string | null {
  if (existingDecision !== null) return 'DECISION_ALREADY_REGISTERED'
  return null
}

describe('decisionSchema — validacion de entrada', () => {
  it('acepta "iterate" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'iterate' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.decision).toBe('iterate')
  })
  it('acepta "scale" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'scale' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.decision).toBe('scale')
  })
  it('acepta "abandon" como decision valida', () => {
    const result = decisionSchema.safeParse({ decision: 'abandon' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.decision).toBe('abandon')
  })
  it('rechaza una decision no reconocida — VALIDATION_ERROR', () => {
    expect(decisionSchema.safeParse({ decision: 'delete' }).success).toBe(false)
  })
  it('rechaza body vacio — VALIDATION_ERROR', () => {
    expect(decisionSchema.safeParse({}).success).toBe(false)
  })
  it('rechaza decision como numero — VALIDATION_ERROR', () => {
    expect(decisionSchema.safeParse({ decision: 42 }).success).toBe(false)
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
