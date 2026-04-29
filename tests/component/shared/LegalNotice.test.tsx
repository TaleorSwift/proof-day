// @vitest-environment jsdom
/**
 * Unit tests — LegalNotice (componente compartido)
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { LegalNotice } from '@/components/shared/LegalNotice'

describe('LegalNotice', () => {
  it('renderiza sin crashes', () => {
    const { container } = render(<LegalNotice />)
    expect(container).toBeInTheDocument()
  })

  it('contiene el texto legal canónico', () => {
    render(<LegalNotice />)
    expect(
      screen.getByText(/Al continuar, aceptas compartir feedback constructivo/)
    ).toBeInTheDocument()
  })
})
