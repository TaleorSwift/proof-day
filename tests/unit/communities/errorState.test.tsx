// @vitest-environment jsdom
/**
 * Tests — Communities error.tsx
 * Verifica el mensaje de error y el botón de reintento.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import CommunitiesError from '@/app/(app)/communities/error'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CommunitiesError', () => {
  const mockError = new Error('Error de prueba') as Error & { digest?: string }
  const mockReset = vi.fn()

  it('renderiza el título "Algo salió mal"', () => {
    render(<CommunitiesError error={mockError} reset={mockReset} />)
    expect(screen.getByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument()
  })

  it('renderiza el mensaje descriptivo', () => {
    render(<CommunitiesError error={mockError} reset={mockReset} />)
    expect(
      screen.getByText('No hemos podido cargar esta página. Por favor, inténtalo de nuevo.')
    ).toBeInTheDocument()
  })

  it('renderiza el botón "Reintentar"', () => {
    render(<CommunitiesError error={mockError} reset={mockReset} />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('llama a reset al hacer click en "Reintentar"', () => {
    const resetFn = vi.fn()
    render(<CommunitiesError error={mockError} reset={resetFn} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(resetFn).toHaveBeenCalledTimes(1)
  })

  it('el botón "Reintentar" es de tipo button (no submit)', () => {
    render(<CommunitiesError error={mockError} reset={mockReset} />)
    const btn = screen.getByRole('button', { name: 'Reintentar' })
    expect(btn).toHaveAttribute('type', 'button')
  })
})
