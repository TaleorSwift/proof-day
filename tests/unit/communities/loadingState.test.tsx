// @vitest-environment jsdom
/**
 * Tests — Communities loading.tsx
 * Verifica que el spinner de carga es accesible.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import CommunitiesLoading from '@/app/(app)/communities/loading'

describe('CommunitiesLoading', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<CommunitiesLoading />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('tiene role="status" para accesibilidad', () => {
    render(<CommunitiesLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('el contenedor principal tiene aria-busy="true"', () => {
    render(<CommunitiesLoading />)
    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-busy', 'true')
  })

  it('el contenedor principal tiene aria-label descriptivo', () => {
    render(<CommunitiesLoading />)
    const container = screen.getByRole('status')
    expect(container.getAttribute('aria-label')).toBe('Cargando…')
  })
})
