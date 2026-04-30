// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { DraftBanner } from '@/components/projects/DraftBanner'

describe('DraftBanner', () => {
  it('renderiza el mensaje de estado borrador', () => {
    render(<DraftBanner />)
    expect(screen.getByText('En borrador — no visible para la comunidad')).toBeInTheDocument()
  })

  it('tiene role="status" para accesibilidad', () => {
    render(<DraftBanner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('tiene aria-label descriptivo del estado de borrador', () => {
    render(<DraftBanner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Estado de borrador')
  })
})
