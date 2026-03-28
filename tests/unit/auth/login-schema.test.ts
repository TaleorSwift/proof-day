import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('acepta email válido', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('acepta email válido con subdominio', () => {
    const result = loginSchema.safeParse({ email: 'user@mail.example.com' })
    expect(result.success).toBe(true)
  })

  it('rechaza email sin @', () => {
    const result = loginSchema.safeParse({ email: 'notanemail' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Introduce un email válido')
    }
  })

  it('rechaza email que empieza por @', () => {
    const result = loginSchema.safeParse({ email: '@domain.com' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Introduce un email válido')
    }
  })

  it('rechaza email con dominio vacío', () => {
    const result = loginSchema.safeParse({ email: 'user@' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Introduce un email válido')
    }
  })

  it('rechaza cadena vacía', () => {
    const result = loginSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Introduce un email válido')
    }
  })
})
