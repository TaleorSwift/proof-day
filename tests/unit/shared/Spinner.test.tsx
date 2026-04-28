// @vitest-environment jsdom
/**
 * Unit tests — Spinner (componente compartido)
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Spinner } from '@/components/shared/Spinner'

describe('Spinner', () => {
  it('renderiza sin errores', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('el contenedor tiene role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('el contenedor tiene aria-busy="true"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
  })

  it('el aria-label por defecto es "Cargando…"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando…')
  })

  it('con prop ariaLabel custom usa ese valor', () => {
    render(<Spinner ariaLabel="Cargando comunidades…" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando comunidades…')
  })
})
