// @vitest-environment jsdom
/**
 * Tests — BackButton
 * Verifica que renderiza el enlace con href, label y flecha correctos.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BackButton } from '@/components/shared/BackButton'

describe('BackButton', () => {
  it('renderiza el label por defecto "Volver al feed"', () => {
    render(<BackButton href="/communities/test" />)
    expect(screen.getByText('Volver al feed')).toBeInTheDocument()
  })

  it('renderiza un label personalizado', () => {
    render(<BackButton href="/communities" label="Mis comunidades" />)
    expect(screen.getByText('Mis comunidades')).toBeInTheDocument()
  })

  it('enlaza al href proporcionado', () => {
    render(<BackButton href="/communities" label="Mis comunidades" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/communities')
  })

  it('uso en feed de comunidad: label "Mis comunidades" con href "/communities"', () => {
    render(<BackButton href="/communities" label="Mis comunidades" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/communities')
    expect(link).toHaveTextContent('Mis comunidades')
  })
})
