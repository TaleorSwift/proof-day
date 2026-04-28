// @vitest-environment jsdom
/**
 * Unit tests — BrandHeader (componente compartido)
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

import { BrandHeader } from '@/components/shared/BrandHeader'

describe('BrandHeader', () => {
  it('renderiza el logo con alt "Proof Day"', () => {
    render(<BrandHeader />)
    expect(screen.getByAltText('Proof Day')).toBeInTheDocument()
  })

  it('renderiza el H1 "Bienvenido a Proof Day"', () => {
    render(<BrandHeader />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Bienvenido a Proof Day' })
    ).toBeInTheDocument()
  })

  it('renderiza el subtítulo por defecto', () => {
    render(<BrandHeader />)
    expect(
      screen.getByText(/Valida ideas\. Aprende más rápido\. Construye lo que importa\./)
    ).toBeInTheDocument()
  })

  it('con prop subtitle custom renderiza ese subtítulo', () => {
    render(<BrandHeader subtitle="Subtítulo personalizado para tests" />)
    expect(screen.getByText('Subtítulo personalizado para tests')).toBeInTheDocument()
  })
})
