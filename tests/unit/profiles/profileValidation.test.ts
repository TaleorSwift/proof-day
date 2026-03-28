/**
 * Tests unitarios — Story 6.1: User Profile (View & Edit)
 * Validan el schema Zod updateProfileSchema para edición de perfil.
 */

import { describe, it, expect } from 'vitest'
import { updateProfileSchema } from '@/lib/validations/profiles'

describe('updateProfileSchema — validaciones de perfil', () => {
  // Test 1: acepta campos vacíos (todos opcionales)
  it('acepta un objeto vacío (todos los campos son opcionales)', () => {
    const result = updateProfileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  // Test 2: acepta datos válidos completos
  it('acepta nombre, bio e intereses válidos', () => {
    const result = updateProfileSchema.safeParse({
      name: 'Ana García',
      bio: 'Diseñadora UX con 5 años de experiencia',
      interests: ['UX', 'Product', 'Startups'],
    })
    expect(result.success).toBe(true)
  })

  // Test 3: rechaza nombre > 60 caracteres
  it('rechaza nombre con más de 60 caracteres', () => {
    const result = updateProfileSchema.safeParse({
      name: 'A'.repeat(61),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  // Test 4: rechaza bio > 500 caracteres
  it('rechaza bio con más de 500 caracteres', () => {
    const result = updateProfileSchema.safeParse({
      bio: 'B'.repeat(501),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.bio).toBeDefined()
    }
  })

  // Test 5: rechaza más de 10 intereses
  it('rechaza más de 10 intereses', () => {
    const result = updateProfileSchema.safeParse({
      interests: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.interests).toBeDefined()
    }
  })

  // Test 6: acepta exactamente 10 intereses
  it('acepta exactamente 10 intereses', () => {
    const result = updateProfileSchema.safeParse({
      interests: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
    })
    expect(result.success).toBe(true)
  })

  // Test 7: rechaza interés individual con más de 30 caracteres
  it('rechaza interés individual con más de 30 caracteres', () => {
    const result = updateProfileSchema.safeParse({
      interests: ['A'.repeat(31)],
    })
    expect(result.success).toBe(false)
  })

  // Test 8: acepta exactamente 60 caracteres en nombre
  it('acepta nombre con exactamente 60 caracteres', () => {
    const result = updateProfileSchema.safeParse({
      name: 'A'.repeat(60),
    })
    expect(result.success).toBe(true)
  })

  // Test 9: acepta bio vacía (string vacío)
  it('acepta bio vacía como string vacío', () => {
    const result = updateProfileSchema.safeParse({
      bio: '',
    })
    expect(result.success).toBe(true)
  })
})
