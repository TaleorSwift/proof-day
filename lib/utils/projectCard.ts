/**
 * Utilidades puras para ProjectCard — Story 8.4
 *
 * Funciones sin side-effects que encapsulan la lógica de presentación
 * y estado de ProjectCard. Testeables en entorno node.
 */

// ── Formato de contador de feedbacks ─────────────────────────────────────────

/**
 * Formatea el contador de feedbacks con la forma singular/plural correcta.
 * @example
 *   formatFeedbackCount(0) → '0 feedbacks'
 *   formatFeedbackCount(1) → '1 feedback'
 *   formatFeedbackCount(5) → '5 feedbacks'
 */
export function formatFeedbackCount(count: number): string {
  return count === 1 ? `${count} feedback` : `${count} feedbacks`
}

// ── Construcción de URL de navegación ────────────────────────────────────────

/**
 * Genera la URL canónica de la página de detalle de un proyecto.
 * @example
 *   buildProjectUrl('startup-madrid', 'proj-123')
 *   → '/communities/startup-madrid/projects/proj-123'
 */
export function buildProjectUrl(communitySlug: string, projectId: string): string {
  return `/communities/${communitySlug}/projects/${projectId}`
}

// ── Iniciales para el placeholder de imagen ──────────────────────────────────

/**
 * Extrae hasta 2 iniciales del título del proyecto, en mayúsculas.
 * Usado cuando el proyecto no tiene imagen (thumbnail placeholder).
 * @example
 *   getProjectInitials('Mi App de Productividad') → 'MA'
 *   getProjectInitials('Productividad')            → 'P'
 *   getProjectInitials('')                         → '?'
 */
export function getProjectInitials(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) return '?'
  return trimmed
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Estado optimista de likes ─────────────────────────────────────────────────

export interface LikeState {
  isActive: boolean
  count: number
}

/**
 * Calcula el nuevo estado optimista del HeartButton tras un toggle.
 * No persiste en BD — solo actualiza estado local de React.
 *
 * Regla: el count no puede bajar de 0.
 *
 * @example
 *   computeLikeState({ isActive: false, count: 3 }) → { isActive: true,  count: 4 }
 *   computeLikeState({ isActive: true,  count: 4 }) → { isActive: false, count: 3 }
 */
export function computeLikeState(current: LikeState): LikeState {
  if (current.isActive) {
    return {
      isActive: false,
      count: Math.max(0, current.count - 1),
    }
  }
  return {
    isActive: true,
    count: current.count + 1,
  }
}
