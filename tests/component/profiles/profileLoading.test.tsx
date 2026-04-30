// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mock del Spinner
// ---------------------------------------------------------------------------

vi.mock('@/components/shared/Spinner', () => ({
  Spinner: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div role="status" aria-label={ariaLabel} data-testid="spinner" />
  ),
}))

import ProfileLoading from '@/app/(app)/profile/loading'

// ---------------------------------------------------------------------------
// Suite: ProfileLoading — renderizado
// ---------------------------------------------------------------------------

describe('ProfileLoading — renderizado', () => {
  it('renderiza el componente Spinner', () => {
    render(<ProfileLoading />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('pasa el ariaLabel "Cargando perfil…" al Spinner', () => {
    render(<ProfileLoading />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando perfil…')
  })

  it('tiene role="status" accesible', () => {
    render(<ProfileLoading />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
