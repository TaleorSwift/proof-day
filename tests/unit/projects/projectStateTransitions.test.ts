import { describe, it, expect } from 'vitest'

/**
 * Lógica de máquina de estados extraída de app/api/projects/[id]/status/route.ts
 * para tests unitarios puros (sin Next.js ni Supabase).
 */

type ProjectStatus = 'draft' | 'live' | 'inactive'

const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['live'],
  live: ['inactive'],
  inactive: [],
}

function isValidTransition(
  currentStatus: ProjectStatus,
  targetStatus: ProjectStatus,
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(targetStatus)
}

function canPublish(
  currentStatus: ProjectStatus,
  targetStatus: 'live' | 'inactive',
  imageUrls: string[],
): { ok: boolean; error?: string } {
  if (!isValidTransition(currentStatus, targetStatus)) {
    return {
      ok: false,
      error: `Transición inválida: ${currentStatus} → ${targetStatus}`,
    }
  }
  if (targetStatus === 'live' && imageUrls.length === 0) {
    return {
      ok: false,
      error: 'Debes añadir al menos una imagen antes de publicar',
    }
  }
  return { ok: true }
}

describe('Máquina de estados de proyectos', () => {
  // Transiciones válidas
  it('draft → live es una transición válida', () => {
    expect(isValidTransition('draft', 'live')).toBe(true)
  })

  it('live → inactive es una transición válida', () => {
    expect(isValidTransition('live', 'inactive')).toBe(true)
  })

  // Transiciones inválidas
  it('draft → inactive es una transición inválida', () => {
    expect(isValidTransition('draft', 'inactive')).toBe(false)
  })

  it('inactive → live es una transición inválida (inactive es terminal en MVP)', () => {
    expect(isValidTransition('inactive', 'live')).toBe(false)
  })

  it('inactive → draft es una transición inválida', () => {
    // draft no está en los targets válidos de inactive
    expect(VALID_TRANSITIONS['inactive']).not.toContain('draft')
  })

  // Validación de imágenes al publicar
  it('publicar con image_urls vacío retorna error PROJECT_MISSING_IMAGES', () => {
    const result = canPublish('draft', 'live', [])
    expect(result.ok).toBe(false)
    expect(result.error).toBe(
      'Debes añadir al menos una imagen antes de publicar',
    )
  })

  it('publicar con al menos 1 imagen es válido', () => {
    const result = canPublish('draft', 'live', ['https://example.com/img.jpg'])
    expect(result.ok).toBe(true)
  })

  it('live → inactive no requiere imágenes', () => {
    const result = canPublish('live', 'inactive', [])
    expect(result.ok).toBe(true)
  })
})
