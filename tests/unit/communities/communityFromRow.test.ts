/**
 * Unit tests — communityFromRow (Story 11.1)
 * Verifica el mapeo real snake_case→camelCase de CommunityRow a Community.
 * TDD Outside-In: verifica la conversión explícita de cada campo.
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

describe('communityFromRow — Story 11.1: snake_case → camelCase', () => {
  it('mapea image_url → imageUrl correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, image_url: 'https://example.com/img.jpg' })
    expect(community.imageUrl).toBe('https://example.com/img.jpg')
  })

  it('mapea image_url null → imageUrl null', () => {
    const community = communityFromRow({ ...BASE_ROW, image_url: null })
    expect(community.imageUrl).toBeNull()
  })

  it('mapea created_by → createdBy correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, created_by: 'user-42' })
    expect(community.createdBy).toBe('user-42')
  })

  it('mapea created_at → createdAt correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, created_at: '2026-03-15T10:00:00Z' })
    expect(community.createdAt).toBe('2026-03-15T10:00:00Z')
  })

  it('mapea updated_at → updatedAt correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, updated_at: '2026-04-01T00:00:00Z' })
    expect(community.updatedAt).toBe('2026-04-01T00:00:00Z')
  })

  it('mapea member_count → memberCount correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, member_count: 7 })
    expect(community.memberCount).toBe(7)
  })

  it('mapea reciprocity_threshold → reciprocityThreshold con valor por defecto 3', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 3 })
    expect(community.reciprocityThreshold).toBe(3)
  })

  it('mapea reciprocity_threshold → reciprocityThreshold con valor personalizado', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 5 })
    expect(community.reciprocityThreshold).toBe(5)
  })

  it('mapea reciprocity_threshold → reciprocityThreshold valor 0 correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, reciprocity_threshold: 0 })
    expect(community.reciprocityThreshold).toBe(0)
  })

  it('preserva campos sin cambio de nombre (id, name, slug, description)', () => {
    const community = communityFromRow({
      ...BASE_ROW,
      name: 'Startup Lab',
      slug: 'startup-lab',
      description: 'Ideas en validación',
    })
    expect(community.id).toBe('comm-1')
    expect(community.name).toBe('Startup Lab')
    expect(community.slug).toBe('startup-lab')
    expect(community.description).toBe('Ideas en validación')
  })

  it('mapea description null correctamente', () => {
    const community = communityFromRow({ ...BASE_ROW, description: null })
    expect(community.description).toBeNull()
  })

  it('NO expone campos snake_case en el resultado (image_url, created_by, etc.)', () => {
    const community = communityFromRow(BASE_ROW)
    expect(Object.keys(community)).not.toContain('image_url')
    expect(Object.keys(community)).not.toContain('created_by')
    expect(Object.keys(community)).not.toContain('created_at')
    expect(Object.keys(community)).not.toContain('updated_at')
    expect(Object.keys(community)).not.toContain('member_count')
    expect(Object.keys(community)).not.toContain('reciprocity_threshold')
  })
})
