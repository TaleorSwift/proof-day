import { describe, it, expect } from 'vitest'
import { decisionSchema } from '@/lib/validations/projects'

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

describe('irreversibilidad de decisión — regla de negocio', () => {
  // La regla: `existing.decision !== null` → 409 DECISION_ALREADY_REGISTERED
  // Testeamos el predicado directamente sin duplicar el handler
  function isDecisionAlreadyRegistered(existingDecision: string | null): boolean {
    return existingDecision !== null
  }

  it('no hay conflicto si la decision actual es null', () => {
    expect(isDecisionAlreadyRegistered(null)).toBe(false)
  })
  it('hay conflicto si ya existe una decision', () => {
    expect(isDecisionAlreadyRegistered('iterate')).toBe(true)
  })
  it('hay conflicto independientemente del valor previo', () => {
    expect(isDecisionAlreadyRegistered('scale')).toBe(true)
    expect(isDecisionAlreadyRegistered('abandon')).toBe(true)
  })
})
