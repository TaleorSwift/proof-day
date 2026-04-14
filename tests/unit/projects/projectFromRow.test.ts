/**
 * Unit tests — projectFromRow (Story 9.1)
 * Verifica el mapeo correcto de tagline y would_use_count desde DB row a dominio
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
}

// Nota: el trigger usa feedback_would_use(scores) que acepta 'yes' (FeedbackFormInline)
// y también (scores->>'p2')::int = 3 (FeedbackDialog legacy). Tests solo verifican el mapeo TS.
describe('projectFromRow — Story 9.1: tagline y would_use_count', () => {
  it('mapea tagline null correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, tagline: null })
    expect(project.tagline).toBeNull()
  })

  it('mapea tagline con valor string correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, tagline: 'La app para validar ideas rápido' })
    expect(project.tagline).toBe('La app para validar ideas rápido')
  })

  it('mapea would_use_count 0 correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, would_use_count: 0 })
    expect(project.wouldUseCount).toBe(0)
  })

  it('mapea would_use_count > 0 correctamente', () => {
    const project = projectFromRow({ ...BASE_ROW, would_use_count: 7 })
    expect(project.wouldUseCount).toBe(7)
  })

  it('preserva campos previos (Story 8.1) al añadir nuevos campos', () => {
    const project = projectFromRow({
      ...BASE_ROW,
      target_user: 'developers',
      demo_url: 'https://demo.example.com',
      feedback_topics: ['UX', 'viabilidad'],
      tagline: 'Valida más rápido',
      would_use_count: 3,
    })
    expect(project.targetUser).toBe('developers')
    expect(project.demoUrl).toBe('https://demo.example.com')
    expect(project.feedbackTopics).toEqual(['UX', 'viabilidad'])
    expect(project.tagline).toBe('Valida más rápido')
    expect(project.wouldUseCount).toBe(3)
  })
})
