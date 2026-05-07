import { describe, it, expect } from 'vitest'
import { updateCommunitySettingsSchema } from '@/lib/validations/communities'

// ---------------------------------------------------------------------------
// Suite: updateCommunitySettingsSchema
// ---------------------------------------------------------------------------

describe('updateCommunitySettingsSchema', () => {
  // Valores válidos
  it('acepta reciprocityThreshold = 0 (gate desactivado)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 0 })
    expect(result.success).toBe(true)
  })

  it('acepta reciprocityThreshold = 1', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 1 })
    expect(result.success).toBe(true)
  })

  it('acepta reciprocityThreshold = 5', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 5 })
    expect(result.success).toBe(true)
  })

  it('acepta reciprocityThreshold = 10 (máximo)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 10 })
    expect(result.success).toBe(true)
  })

  // Valores inválidos — fuera de rango
  it('rechaza reciprocityThreshold = -1 (menor que mínimo)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: -1 })
    expect(result.success).toBe(false)
  })

  it('rechaza reciprocityThreshold = 11 (mayor que máximo)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 11 })
    expect(result.success).toBe(false)
  })

  // Valores no enteros
  it('rechaza reciprocityThreshold = 2.5 (no entero)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 2.5 })
    expect(result.success).toBe(false)
  })

  it('rechaza reciprocityThreshold = 0.1 (no entero)', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 0.1 })
    expect(result.success).toBe(false)
  })

  // Tipos inválidos
  it('rechaza reciprocityThreshold cuando es un string', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: '5' })
    expect(result.success).toBe(false)
  })

  it('rechaza reciprocityThreshold cuando es null', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: null })
    expect(result.success).toBe(false)
  })

  it('rechaza el objeto vacío (campo requerido)', () => {
    const result = updateCommunitySettingsSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  // Mensaje de error correcto
  it('incluye mensaje de error indicando que debe ser entero cuando no es entero', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 3.5 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue: { message: string }) => issue.message)
      expect(messages.some((msg: string) => /entero/i.test(msg))).toBe(true)
    }
  })

  it('incluye mensaje de error indicando mínimo 0 cuando es negativo', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: -1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue: { message: string }) => issue.message)
      expect(messages.some((msg: string) => /0/i.test(msg))).toBe(true)
    }
  })

  it('incluye mensaje de error indicando máximo 10 cuando supera el límite', () => {
    const result = updateCommunitySettingsSchema.safeParse({ reciprocityThreshold: 15 })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue: { message: string }) => issue.message)
      expect(messages.some((msg: string) => /10/i.test(msg))).toBe(true)
    }
  })
})
