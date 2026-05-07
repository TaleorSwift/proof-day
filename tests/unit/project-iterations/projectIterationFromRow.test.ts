/**
 * Unit tests — projectIterationFromRow (Story 13.1)
 * Verifica el mapeo correcto de snake_case → camelCase para project_iterations
 * TDD Outside-In: escritos antes de la implementación
 */

import { describe, it, expect } from 'vitest'
import { projectIterationFromRow } from '@/lib/types/project-iterations'
import type { ProjectIterationRow } from '@/lib/types/project-iterations'

const BASE_ROW: ProjectIterationRow = {
  id: 'iter-1',
  project_id: 'proj-1',
  version_number: 1,
  title: 'Primera versión',
  description: 'Descripción de la primera versión',
  hypothesis: 'Hipótesis inicial del proyecto',
  published_at: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
}

describe('projectIterationFromRow — Story 13.1', () => {
  it('mapea id correctamente', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.id).toBe('iter-1')
  })

  it('mapea project_id → projectId', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.projectId).toBe('proj-1')
  })

  it('mapea version_number → versionNumber', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.versionNumber).toBe(1)
  })

  it('mapea title correctamente', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.title).toBe('Primera versión')
  })

  it('mapea description correctamente', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.description).toBe('Descripción de la primera versión')
  })

  it('mapea hypothesis correctamente', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.hypothesis).toBe('Hipótesis inicial del proyecto')
  })

  it('mapea published_at → publishedAt', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.publishedAt).toBe('2026-01-01T00:00:00Z')
  })

  it('mapea created_at → createdAt', () => {
    const iteration = projectIterationFromRow(BASE_ROW)
    expect(iteration.createdAt).toBe('2026-01-01T00:00:00Z')
  })

  it('mapea title null correctamente', () => {
    const iteration = projectIterationFromRow({ ...BASE_ROW, title: null })
    expect(iteration.title).toBeNull()
  })

  it('mapea description null correctamente', () => {
    const iteration = projectIterationFromRow({ ...BASE_ROW, description: null })
    expect(iteration.description).toBeNull()
  })

  it('mapea hypothesis null correctamente', () => {
    const iteration = projectIterationFromRow({ ...BASE_ROW, hypothesis: null })
    expect(iteration.hypothesis).toBeNull()
  })

  it('mapea todos los campos nullable a null simultáneamente', () => {
    const iteration = projectIterationFromRow({
      ...BASE_ROW,
      title: null,
      description: null,
      hypothesis: null,
    })
    expect(iteration.title).toBeNull()
    expect(iteration.description).toBeNull()
    expect(iteration.hypothesis).toBeNull()
  })

  it('preserva todos los campos en un row completo', () => {
    const iteration = projectIterationFromRow({
      id: 'iter-42',
      project_id: 'proj-99',
      version_number: 3,
      title: 'Versión 3',
      description: 'Rediseño completo',
      hypothesis: 'Los usuarios necesitan flujo simplificado',
      published_at: '2026-03-15T10:30:00Z',
      created_at: '2026-03-15T10:00:00Z',
    })
    expect(iteration.id).toBe('iter-42')
    expect(iteration.projectId).toBe('proj-99')
    expect(iteration.versionNumber).toBe(3)
    expect(iteration.title).toBe('Versión 3')
    expect(iteration.description).toBe('Rediseño completo')
    expect(iteration.hypothesis).toBe('Los usuarios necesitan flujo simplificado')
    expect(iteration.publishedAt).toBe('2026-03-15T10:30:00Z')
    expect(iteration.createdAt).toBe('2026-03-15T10:00:00Z')
  })
})
