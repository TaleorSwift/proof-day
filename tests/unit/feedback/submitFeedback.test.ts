import { describe, it, expect } from 'vitest'
import { submitFeedbackSchema } from '@/lib/validations/feedback'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_P4 = 'Mejoraría la claridad del problema planteado.'

describe('submitFeedbackSchema', () => {
  // Test 1: rechaza scores fuera de {1,2,3}
  it('rechaza scores con valor 0 (fuera de rango)', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 0, p2: 2, p3: 3 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(false)
  })

  // Test 2: rechaza scores con valor 4 (fuera de rango)
  it('rechaza scores con valor 4 (fuera de rango)', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 1, p2: 4, p3: 3 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(false)
  })

  // Test 3: rechaza P4 con menos de 10 caracteres
  it('rechaza P4 con menos de 10 caracteres', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: { p4: 'Corto' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const p4Error = result.error.issues.find(
        (i) => i.path.includes('p4')
      )
      expect(p4Error?.message).toBe('Escribe al menos 10 caracteres en tu respuesta')
    }
  })

  // Test 4: acepta P4 con exactamente 10 caracteres
  it('acepta P4 con exactamente 10 caracteres', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 3, p2: 3, p3: 3 },
      textResponses: { p4: '1234567890' },
    })
    expect(result.success).toBe(true)
  })

  // Test 5: acepta texto opcional en P1-P3 (sin p1, p2, p3)
  it('acepta textResponses sin p1, p2, p3 (son opcionales)', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 2, p2: 1, p3: 3 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(true)
  })

  // Test 6: acepta texto opcional en P1-P3 (con p1, p2, p3)
  it('acepta textResponses con p1, p2 y p3 opcionales incluidos', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: {
        p1: 'Sí, es claro.',
        p2: 'Quizás.',
        p3: 'Depende del stack.',
        p4: VALID_P4,
      },
    })
    expect(result.success).toBe(true)
  })

  // Test 7: valida scores {p1:3, p2:2, p3:1} como válidos
  it('acepta scores válidos {p1:3, p2:2, p3:1} (Yes/Somewhat/No)', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.scores).toEqual({ p1: 3, p2: 2, p3: 1 })
    }
  })

  // Test 8: rechaza projectId inválido (no UUID)
  it('rechaza projectId que no es UUID', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: 'no-es-uuid',
      communityId: VALID_UUID,
      scores: { p1: 1, p2: 2, p3: 3 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(false)
  })

  // Test 9: rechaza comunityId inválido (no UUID)
  it('rechaza communityId que no es UUID', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: 'no-es-uuid',
      scores: { p1: 1, p2: 2, p3: 3 },
      textResponses: { p4: VALID_P4 },
    })
    expect(result.success).toBe(false)
  })

  // Test 10: rechaza P4 vacío
  it('rechaza P4 vacío', () => {
    const result = submitFeedbackSchema.safeParse({
      projectId: VALID_UUID,
      communityId: VALID_UUID,
      scores: { p1: 1, p2: 2, p3: 3 },
      textResponses: { p4: '' },
    })
    expect(result.success).toBe(false)
  })
})
