import { describe, it, expect } from 'vitest'
import { createCommunitySchema } from '@/lib/validations/communities'
import { toSlug } from '@/lib/utils/slug'

describe('createCommunitySchema', () => {
  it('rechaza nombre vacío', () => {
    const result = createCommunitySchema.safeParse({
      name: '',
      description: 'Descripción válida',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres')
    }
  })

  it('rechaza nombre menor de 3 caracteres', () => {
    const result = createCommunitySchema.safeParse({
      name: 'AB',
      description: 'Descripción válida',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre debe tener al menos 3 caracteres')
    }
  })

  it('rechaza descripción vacía', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Mi comunidad',
      description: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La descripción es obligatoria')
    }
  })

  it('acepta imageUrl vacío (string vacío)', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Mi comunidad',
      description: 'Descripción válida',
      imageUrl: '',
    })
    expect(result.success).toBe(true)
  })

  it('acepta sin imageUrl (undefined)', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Mi comunidad',
      description: 'Descripción válida',
    })
    expect(result.success).toBe(true)
  })

  it('acepta datos completos válidos', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Startup Madrid',
      description: 'Comunidad de startups en Madrid',
      imageUrl: 'https://ejemplo.com/imagen.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombre mayor de 60 caracteres', () => {
    const result = createCommunitySchema.safeParse({
      name: 'A'.repeat(61),
      description: 'Descripción válida',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El nombre no puede superar 60 caracteres')
    }
  })

  it('rechaza imageUrl inválida (no URL)', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Mi comunidad',
      description: 'Descripción válida',
      imageUrl: 'no-es-una-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('URL de imagen inválida')
    }
  })

  it('rechaza descripción mayor de 500 caracteres', () => {
    const result = createCommunitySchema.safeParse({
      name: 'Mi comunidad',
      description: 'A'.repeat(501),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La descripción no puede superar 500 caracteres')
    }
  })
})

describe('toSlug', () => {
  it('convierte nombre simple a slug', () => {
    expect(toSlug('Mi Comunidad!')).toBe('mi-comunidad')
  })

  it('elimina acentos y caracteres especiales', () => {
    expect(toSlug('Café & Ideas')).toBe('cafe-ideas')
  })

  it('convierte espacios múltiples a guión simple', () => {
    expect(toSlug('Startup   Madrid')).toBe('startup-madrid')
  })

  it('elimina guiones al inicio y al final', () => {
    expect(toSlug('  Mi Comunidad  ')).toBe('mi-comunidad')
  })

  it('convierte nombre con ñ', () => {
    expect(toSlug('España Innovación')).toBe('espana-innovacion')
  })

  it('nombre puramente numérico conserva los dígitos (CR2-L1)', () => {
    expect(toSlug('12345')).toBe('12345')
  })
})
