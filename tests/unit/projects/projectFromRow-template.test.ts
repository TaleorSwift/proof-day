/**
 * Unit tests — projectFromRow con template_id (Story 10.1)
 * Verifica el mapeo correcto de template_id desde DB row a dominio
 * TDD Outside-In: escritos antes de la implementación
 */

import { describe, it, expect } from 'vitest'
import { projectFromRow } from '@/lib/types/projects'
import type { ProjectRow } from '@/lib/types/projects'

const BASE_ROW: ProjectRow = {
  id: 'proj-1',
  slug: 'test-project',
  community_id: 'comm-1',
  builder_id: 'user-1',
  title: 'Test Project',
  problem: 'A problem',
  solution: 'A solution',
  hypothesis: 'A hypothesis',
  image_urls: [],
  status: 'live',
  decision: null,
  decided_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  target_user: null,
  demo_url: null,
  feedback_topics: null,
  tagline: null,
  would_use_count: 0,
  template_id: null,
  // Story 11.1 — feedback quality
  custom_question: null,
  quality_threshold: 0.6,
}

describe('projectFromRow — Story 10.1: template_id', () => {
  it('mapea template_id null correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, template_id: null })
    expect(project.templateId).toBeNull()
  })

  it('mapea template_id con uuid válido correctamente', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const project = projectFromRow({ ...BASE_ROW, template_id: uuid })
    expect(project.templateId).toBe(uuid)
  })

  it('preserva campos previos (Story 9.1) al añadir template_id', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440001'
    const project = projectFromRow({
      ...BASE_ROW,
      tagline: 'Valida más rápido',
      would_use_count: 5,
      template_id: uuid,
    })
    expect(project.tagline).toBe('Valida más rápido')
    expect(project.wouldUseCount).toBe(5)
    expect(project.templateId).toBe(uuid)
  })

  it('proyectos existentes sin template_id tienen templateId null (AC-4 retrocompatibilidad)', () => {
    const project = projectFromRow({ ...BASE_ROW, template_id: null })
    expect(project.templateId).toBeNull()
  })
})
