/**
 * Unit tests — templateFromRow (Story 10.1)
 * Verifica el shape correcto de ProjectTemplate y el mapeo desde ProjectTemplateRow
 * TDD Outside-In: escritos antes de la implementación
 */

import { describe, it, expect } from 'vitest'
import { templateFromRow } from '@/lib/types/templates'
import type { ProjectTemplateRow } from '@/lib/types/templates'

const BASE_TEMPLATE_ROW: ProjectTemplateRow = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'saas',
  name: 'Producto SaaS',
  description_structure: {
    problem: {
      placeholder: 'Ej: placeholder para problema',
      example: 'Ejemplo de problema real',
    },
    solution: {
      placeholder: 'Ej: placeholder para solución',
      example: 'Ejemplo de solución real',
    },
  },
  reviewer_context: 'Para productos SaaS, el feedback más útil aborda...',
  created_at: '2026-04-30T00:00:00Z',
}

describe('templateFromRow — Story 10.1: ProjectTemplate shape', () => {
  it('mapea id correctamente', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('mapea type correctamente', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.type).toBe('saas')
  })

  it('mapea name correctamente', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.name).toBe('Producto SaaS')
  })

  it('mapea description_structure → descriptionStructure (camelCase)', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.descriptionStructure).toEqual({
      problem: {
        placeholder: 'Ej: placeholder para problema',
        example: 'Ejemplo de problema real',
      },
      solution: {
        placeholder: 'Ej: placeholder para solución',
        example: 'Ejemplo de solución real',
      },
    })
  })

  it('mapea reviewer_context → reviewerContext (camelCase)', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.reviewerContext).toBe('Para productos SaaS, el feedback más útil aborda...')
  })

  it('mapea created_at → createdAt (camelCase)', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.createdAt).toBe('2026-04-30T00:00:00Z')
  })

  it('descriptionStructure tiene campos problem y solution con placeholder y example', () => {
    const template = templateFromRow(BASE_TEMPLATE_ROW)
    expect(template.descriptionStructure.problem.placeholder).toBeTruthy()
    expect(template.descriptionStructure.problem.example).toBeTruthy()
    expect(template.descriptionStructure.solution.placeholder).toBeTruthy()
    expect(template.descriptionStructure.solution.example).toBeTruthy()
  })
})
