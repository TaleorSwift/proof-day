/**
 * Unit tests — communityFromRow (Story 11.1)
 * Verifica el mapeo correcto de reciprocity_threshold y demás campos desde DB row a dominio
 * TDD Outside-In: escritos antes de la implementación
 */

import { describe, it, expect } from 'vitest'
import { communityFromRow } from '@/lib/types/communities'
import type { CommunityRow } from '@/lib/types/communities'

const BASE_ROW: CommunityRow = {
  id: 'comm-1',
  name: 'Test Community',
  slug: 'test-community',
  description: null,
  image_url: null,
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  member_count: 1,
  reciprocity_threshold: 3,
}

describe('communityFromRow — Story 11.1: reciprocity_threshold', () => {
  it('mapea reciprocity_threshold con valor por defecto 3', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 3 })
    expect(community.reciprocity_threshold).toBe(3)
  })

  it('mapea reciprocity_threshold con valor personalizado', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 5 })
    expect(community.reciprocity_threshold).toBe(5)
  })

  it('mapea reciprocity_threshold 0 correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 0 })
    expect(community.reciprocity_threshold).toBe(0)
  })

  it('preserva campos previos (id, name, slug, description, image_url, created_by, timestamps, member_count)', () => {
    const community = communityFromRow({
      ...BASE_ROW,
      name: 'Startup Lab',
      slug: 'startup-lab',
      description: 'Ideas en validación',
      image_url: 'https://example.com/img.jpg',
      member_count: 7,
      reciprocity_threshold: 4,
    })
    expect(community.id).toBe('comm-1')
    expect(community.name).toBe('Startup Lab')
    expect(community.slug).toBe('startup-lab')
    expect(community.description).toBe('Ideas en validación')
    expect(community.image_url).toBe('https://example.com/img.jpg')
    expect(community.member_count).toBe(7)
    expect(community.reciprocity_threshold).toBe(4)
  })

  it('mapea description null correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, description: null })
    expect(community.description).toBeNull()
  })

  it('mapea image_url null correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, image_url: null })
    expect(community.image_url).toBeNull()
  })
})
