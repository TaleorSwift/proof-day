/**
 * Unit tests — projectFromRow con campos Story 11.1
 * Verifica el mapeo correcto de custom_question y quality_threshold desde DB row a dominio
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
  custom_question: null,
  quality_threshold: 0.6,
}

describe('projectFromRow — Story 11.1: custom_question y quality_threshold', () => {
  it('mapea custom_question null correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, custom_question: null })
    expect(project.customQuestion).toBeNull()
  })

  it('mapea custom_question con valor string correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, custom_question: '¿Pagarías por esto?' })
    expect(project.customQuestion).toBe('¿Pagarías por esto?')
  })

  it('mapea quality_threshold con valor por defecto 0.6', () => {
    const project = projectFromRow({ ...BASE_ROW, quality_threshold: 0.6 })
    expect(project.qualityThreshold).toBe(0.6)
  })

  it('mapea quality_threshold con valor personalizado', () => {
    const project = projectFromRow({ ...BASE_ROW, quality_threshold: 0.8 })
    expect(project.qualityThreshold).toBe(0.8)
  })

  it('preserva todos los campos previos (Story 9.1, 10.1) al añadir campos 11.1', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const project = projectFromRow({
      ...BASE_ROW,
      tagline: 'Valida más rápido',
      would_use_count: 5,
      template_id: uuid,
      custom_question: '¿Lo usarías en tu empresa?',
      quality_threshold: 0.7,
    })
    expect(project.tagline).toBe('Valida más rápido')
    expect(project.wouldUseCount).toBe(5)
    expect(project.templateId).toBe(uuid)
    expect(project.customQuestion).toBe('¿Lo usarías en tu empresa?')
    expect(project.qualityThreshold).toBe(0.7)
  })
})
