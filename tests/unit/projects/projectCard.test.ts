// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

/**
 * Tests unitarios — Story 8.4: ProjectCard rediseño horizontal
 *
 * Estrategia de testing:
 *
 * A) Funciones puras relacionadas con ProjectCard — testeables en node/jsdom:
 *    - formatFeedbackCount, buildProjectUrl, getProjectInitials, computeLikeState
 *
 * B) Tests de componente React — activados con pragma @vitest-environment jsdom.
 *    next/link y next/image se mockean para evitar dependencias del runtime de Next.js.
 */

// ── Mocks de módulos Next.js ──────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src, alt, ...props }),
}))

// ── Funciones puras ───────────────────────────────────────────────────────────

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

// ── E. Tests de componente React ──────────────────────────────────────────────

import { ProjectCard } from '@/components/projects/ProjectCard'

const PROJECT_MINIMAL = {
  id: 'proj-1',
  title: 'Mi Proyecto',
  imageUrls: [] as string[],
  status: 'live' as const,
  builderId: 'user-builder-1',
}

describe('ProjectCard — render de componente', () => {
  it('renderiza skeleton en estado loading', () => {
    render(
      React.createElement(ProjectCard, {
        project: PROJECT_MINIMAL,
        communitySlug: 'startup-madrid',
        isLoading: true,
      })
    )
    const card = screen.getByTestId('project-card')
    expect(card).toBeInTheDocument()
    // En loading no aparece el título
    expect(screen.queryByTestId('project-card-title')).not.toBeInTheDocument()
  })

  it('renderiza el título del proyecto', () => {
    render(
      React.createElement(ProjectCard, {
        project: PROJECT_MINIMAL,
        communitySlug: 'startup-madrid',
      })
    )
    expect(screen.getByTestId('project-card-title')).toHaveTextContent('Mi Proyecto')
  })

  it('renderiza StatusBadge con el estado correcto', () => {
    render(
      React.createElement(ProjectCard, {
        project: PROJECT_MINIMAL,
        communitySlug: 'startup-madrid',
      })
    )
    const statusEl = screen.getByTestId('project-card-status')
    expect(statusEl).toBeInTheDocument()
    expect(statusEl.textContent).toBeTruthy()
  })

  it('renderiza placeholder de iniciales cuando no hay imagen', () => {
    render(
      React.createElement(ProjectCard, {
        project: PROJECT_MINIMAL,
        communitySlug: 'startup-madrid',
      })
    )
    expect(screen.getByTestId('project-card-placeholder')).toBeInTheDocument()
  })

  it('no renderiza placeholder cuando hay imagen', () => {
    render(
      React.createElement(ProjectCard, {
        project: { ...PROJECT_MINIMAL, imageUrls: ['https://example.com/img.jpg'] },
        communitySlug: 'startup-madrid',
      })
    )
    expect(screen.queryByTestId('project-card-placeholder')).not.toBeInTheDocument()
  })

  it('renderiza el contador de feedbacks', () => {
    render(
      React.createElement(ProjectCard, {
        project: PROJECT_MINIMAL,
        communitySlug: 'startup-madrid',
        feedbackCount: 5,
      })
    )
    expect(screen.getByTestId('project-card-feedback-count')).toHaveTextContent('5 feedbacks')
  })
})
