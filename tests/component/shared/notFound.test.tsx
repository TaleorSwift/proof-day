// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NotFound from '@/app/not-found'

describe('NotFound — página 404', () => {
  it('renderiza el título "Página no encontrada"', () => {
    render(<NotFound />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Página no encontrada')
  })

  it('renderiza el texto descriptivo del error', () => {
    render(<NotFound />)

    expect(screen.getByText('El recurso que buscas no existe.')).toBeDefined()
  })

  it('renderiza un elemento main como contenedor', () => {
    const { container } = render(<NotFound />)

    expect(container.querySelector('main')).toBeTruthy()
  })
})
