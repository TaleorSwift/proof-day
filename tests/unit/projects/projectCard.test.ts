import { describe, it, expect } from 'vitest'

/**
 * Tests unitarios — Story 8.4: ProjectCard rediseño horizontal
 *
 * Estrategia de testing en entorno `environment: node`:
 *
 * A) Funciones puras relacionadas con ProjectCard — testeables en node:
 *    - formatFeedbackCount: formatea el contador de feedbacks
 *    - buildProjectUrl: genera la URL de navegación
 *    - getProjectInitials: extrae iniciales para el placeholder
 *    - computeLikeState: lógica de toggle de likes (optimistic UI)
 *
 * B) Tests de componente React — requieren environment: jsdom.
 *    Marcados con describe.skip. Para habilitarlos:
 *    1. Añadir a vitest.config.ts: environment: 'jsdom'
 *    2. O crear un vitest.config.components.ts separado con jsdom
 *    3. Instalar @testing-library/react y @testing-library/jest-dom
 *    Ref: https://testing-library.com/docs/react-testing-library/setup
 */

// ── Funciones puras que vamos a testear ──────────────────────────────────────
// Importamos desde el módulo de utilidades de proyectos donde vivirán

import {
  formatFeedbackCount,
  buildProjectUrl,
  getProjectInitials,
  computeLikeState,
} from '@/lib/utils/projectCard'

// ── A. formatFeedbackCount ────────────────────────────────────────────────────

describe('formatFeedbackCount', () => {
  it('devuelve "0 feedbacks" cuando count es 0', () => {
    expect(formatFeedbackCount(0)).toBe('0 feedbacks')
  })

  it('devuelve "1 feedback" (singular) cuando count es 1', () => {
    expect(formatFeedbackCount(1)).toBe('1 feedback')
  })

  it('devuelve "5 feedbacks" (plural) cuando count es 5', () => {
    expect(formatFeedbackCount(5)).toBe('5 feedbacks')
  })

  it('devuelve "100 feedbacks" para valores grandes', () => {
    expect(formatFeedbackCount(100)).toBe('100 feedbacks')
  })
})

// ── B. buildProjectUrl ────────────────────────────────────────────────────────

describe('buildProjectUrl', () => {
  it('genera la URL correcta con communitySlug e id', () => {
    expect(buildProjectUrl('startup-madrid', 'proj-123')).toBe(
      '/communities/startup-madrid/projects/proj-123'
    )
  })

  it('funciona con slugs que contienen guiones', () => {
    expect(buildProjectUrl('mi-comunidad-2026', 'abc-def')).toBe(
      '/communities/mi-comunidad-2026/projects/abc-def'
    )
  })

  it('no añade slash final', () => {
    const url = buildProjectUrl('startup-madrid', 'proj-1')
    expect(url.endsWith('/')).toBe(false)
  })
})

// ── C. getProjectInitials ─────────────────────────────────────────────────────

describe('getProjectInitials', () => {
  it('devuelve las dos primeras iniciales de un título con varias palabras', () => {
    expect(getProjectInitials('Mi App de Productividad')).toBe('MA')
  })

  it('devuelve una sola inicial si el título es una sola palabra', () => {
    expect(getProjectInitials('Productividad')).toBe('P')
  })

  it('devuelve las iniciales en mayúsculas', () => {
    expect(getProjectInitials('tiempo libre')).toBe('TL')
  })

  it('devuelve "?" para título vacío', () => {
    expect(getProjectInitials('')).toBe('?')
  })

  it('no excede 2 caracteres aunque el título tenga muchas palabras', () => {
    const initials = getProjectInitials('App Para Gestión De Equipos Remotos')
    expect(initials.length).toBeLessThanOrEqual(2)
  })
})

// ── D. computeLikeState (optimistic UI toggle) ────────────────────────────────

describe('computeLikeState', () => {
  it('toggle de inactivo a activo incrementa el count en 1', () => {
    const result = computeLikeState({ isActive: false, count: 3 })
    expect(result).toEqual({ isActive: true, count: 4 })
  })

  it('toggle de activo a inactivo decrementa el count en 1', () => {
    const result = computeLikeState({ isActive: true, count: 4 })
    expect(result).toEqual({ isActive: false, count: 3 })
  })

  it('el count no baja de 0 al quitar like con count en 0', () => {
    const result = computeLikeState({ isActive: true, count: 0 })
    expect(result.count).toBeGreaterThanOrEqual(0)
  })

  it('con count inicial 0 y no activo, activar da count 1', () => {
    const result = computeLikeState({ isActive: false, count: 0 })
    expect(result).toEqual({ isActive: true, count: 1 })
  })
})

// ── E. Tests de componente React (requieren jsdom) ────────────────────────────

describe.skip('ProjectCard — render de componente (requiere environment: jsdom)', () => {
  /**
   * Para habilitar estos tests:
   * 1. En vitest.config.ts cambiar environment: 'node' por environment: 'jsdom'
   *    o crear un workspace con configuración separada.
   * 2. Instalar: npm install -D @testing-library/react @testing-library/jest-dom
   * 3. Añadir a setupFiles: './tests/setup/vitest-dom.ts'
   *
   * Ejemplo de setup file:
   *   import '@testing-library/jest-dom'
   *
   * Los tests de abajo quedan documentados como especificación
   * del comportamiento esperado del componente.
   */

  it('render con props mínimas (sin imagen, status live, feedbackCount 0)', () => {
    // const { getByTestId, getByText } = render(
    //   <ProjectCard
    //     id="proj-1"
    //     title="Mi Proyecto"
    //     description="Descripción corta"
    //     imageUrls={[]}
    //     status="live"
    //     builderName="Ana García"
    //     feedbackCount={0}
    //     communitySlug="startup-madrid"
    //   />
    // )
    // expect(getByTestId('project-card-title')).toHaveTextContent('Mi Proyecto')
    // expect(getByTestId('project-card-placeholder')).toBeInTheDocument()
    // expect(getByTestId('project-card-feedback-count')).toHaveTextContent('0 feedbacks')
  })

  it('render con imagen → src correcto en el thumbnail', () => {
    // const imageUrl = 'https://example.com/image.jpg'
    // const { getByAltText } = render(
    //   <ProjectCard
    //     id="proj-2"
    //     title="Proyecto con imagen"
    //     description="Descripción"
    //     imageUrls={[imageUrl]}
    //     status="live"
    //     builderName="Carlos López"
    //     feedbackCount={3}
    //     communitySlug="startup-madrid"
    //   />
    // )
    // const img = getByAltText('Proyecto con imagen')
    // expect(img).toHaveAttribute('src', expect.stringContaining(imageUrl))
  })

  it('StatusBadge muestra "Live" para status live', () => {
    // expect(getByText('Live')).toBeInTheDocument()
  })

  it('StatusBadge muestra "Cerrado" para status inactive', () => {
    // expect(getByText('Cerrado')).toBeInTheDocument()
  })

  it('StatusBadge muestra "Borrador" para status draft', () => {
    // expect(getByText('Borrador')).toBeInTheDocument()
  })

  it('feedbackCount=1 → muestra "1 feedback" (singular)', () => {
    // expect(getByTestId('project-card-feedback-count')).toHaveTextContent('1 feedback')
  })

  it('link apunta a la URL correcta /communities/{slug}/projects/{id}', () => {
    // const link = getByRole('link')
    // expect(link).toHaveAttribute('href', '/communities/startup-madrid/projects/proj-1')
  })

  it('HeartButton incrementa el contador localmente al hacer click', () => {
    // Probar interacción: click en HeartButton → count sube de 2 a 3
    // userEvent.click(heartButton)
    // expect(getByTestId('project-card-like-count')).toHaveTextContent('3')
  })
})
