// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { InactiveBanner } from '@/components/projects/InactiveBanner'

describe('InactiveBanner', () => {
  it('renderiza el mensaje de proyecto inactivo', () => {
    render(<InactiveBanner />)
    expect(screen.getByText('Este proyecto está inactivo — el desarrollo ha sido detenido.')).toBeInTheDocument()
  })

  it('tiene role="status" para accesibilidad', () => {
    render(<InactiveBanner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('tiene aria-label descriptivo del estado inactivo', () => {
    render(<InactiveBanner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Proyecto inactivo')
  })
})
