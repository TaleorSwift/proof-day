import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/utils/string'

describe('getInitials', () => {
  it('retorna las iniciales en mayúsculas de un nombre simple', () => {
    expect(getInitials('Juan García')).toBe('JG')
  })

  it('retorna una sola inicial cuando el nombre tiene una sola palabra', () => {
    expect(getInitials('Marcos')).toBe('M')
  })

  it('retorna "?" para una cadena vacía', () => {
    expect(getInitials('')).toBe('?')
  })

  it('retorna "?" para una cadena de solo espacios', () => {
    expect(getInitials('   ')).toBe('?')
  })

  it('limita a 2 iniciales aunque el nombre tenga más palabras', () => {
    expect(getInitials('Juan Pablo García López')).toBe('JP')
  })

  it('convierte las iniciales a mayúsculas aunque el nombre esté en minúsculas', () => {
    expect(getInitials('ana belén')).toBe('AB')
  })

  it('maneja espacios múltiples entre palabras correctamente', () => {
    expect(getInitials('Carlos   López')).toBe('CL')
  })

  it('retorna una inicial correcta para nombre con una letra', () => {
    expect(getInitials('A B')).toBe('AB')
  })
})
