import { describe, it, expect } from 'vitest'
import { createProjectSchema } from '@/lib/validations/projects'

const validProject = {
  title: 'Mi proyecto de prueba',
  problem: 'El problema que resuelvo es que los usuarios no pueden hacer X',
  solution: 'La solución consiste en implementar Y para que Z funcione correctamente',
  hypothesis: 'Creemos que si implementamos Y, los usuarios podrán hacer X en menos tiempo',
  imageUrls: ['https://example.com/imagen1.jpg'],
  communityId: '123e4567-e89b-12d3-a456-426614174000',
}

describe('createProjectSchema', () => {
  it('rechaza título vacío', () => {
    const result = createProjectSchema.safeParse({ ...validProject, title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El título es obligatorio')
    }
  })

  it('rechaza título mayor de 120 caracteres', () => {
    const result = createProjectSchema.safeParse({ ...validProject, title: 'A'.repeat(121) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El título no puede superar 120 caracteres')
    }
  })

  it('rechaza imageUrls vacío (array sin elementos)', () => {
    const result = createProjectSchema.safeParse({ ...validProject, imageUrls: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Debes añadir al menos una imagen')
    }
  })

  it('rechaza imageUrls con más de 5 elementos', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      imageUrls: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
        'https://example.com/6.jpg',
      ],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('No puedes añadir más de 5 imágenes')
    }
  })

  it('rechaza URL de imagen inválida', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      imageUrls: ['no-es-una-url'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('URL de imagen inválida')
    }
  })

  it('acepta entrada completamente válida', () => {
    const result = createProjectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe(validProject.title)
      expect(result.data.imageUrls).toHaveLength(1)
    }
  })

  it('rechaza problema vacío', () => {
    const result = createProjectSchema.safeParse({ ...validProject, problem: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La descripción del problema es obligatoria')
    }
  })

  it('rechaza hipótesis mayor de 500 caracteres', () => {
    const result = createProjectSchema.safeParse({ ...validProject, hypothesis: 'H'.repeat(501) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La hipótesis no puede superar 500 caracteres')
    }
  })

  it('acepta exactamente 5 imágenes (límite máximo)', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      imageUrls: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza solución mayor de 1000 caracteres', () => {
    const result = createProjectSchema.safeParse({ ...validProject, solution: 'S'.repeat(1001) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('La solución no puede superar 1000 caracteres')
    }
  })
})
