// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ProofScoreBadge } from '@/components/proof-score/ProofScoreBadge'

// ---------------------------------------------------------------------------
// Suite: label Promising
// ---------------------------------------------------------------------------

describe('ProofScoreBadge — label Promising', () => {
  it('muestra el texto "Promising"', () => {
    render(<ProofScoreBadge label="Promising" />)
    expect(screen.getByText('Promising')).toBeInTheDocument()
  })

  it('muestra el icono ✓', () => {
    render(<ProofScoreBadge label="Promising" />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('muestra la descripción correspondiente a Promising', () => {
    render(<ProofScoreBadge label="Promising" />)
    expect(screen.getByText(/el equipo ve potencial real/i)).toBeInTheDocument()
  })

  it('tiene role="status" con aria-label que incluye el label', () => {
    render(<ProofScoreBadge label="Promising" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'Proof Score: Promising')
  })
})

// ---------------------------------------------------------------------------
// Suite: label Needs iteration
// ---------------------------------------------------------------------------

describe('ProofScoreBadge — label Needs iteration', () => {
  it('muestra el texto "Needs iteration"', () => {
    render(<ProofScoreBadge label="Needs iteration" />)
    expect(screen.getByText('Needs iteration')).toBeInTheDocument()
  })

  it('muestra el icono ⟳', () => {
    render(<ProofScoreBadge label="Needs iteration" />)
    expect(screen.getByText('⟳')).toBeInTheDocument()
  })

  it('muestra la descripción correspondiente a Needs iteration', () => {
    render(<ProofScoreBadge label="Needs iteration" />)
    expect(screen.getByText(/la solución genera dudas/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: label Weak
// ---------------------------------------------------------------------------

describe('ProofScoreBadge — label Weak', () => {
  it('muestra el texto "Weak"', () => {
    render(<ProofScoreBadge label="Weak" />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('muestra el icono ✗', () => {
    render(<ProofScoreBadge label="Weak" />)
    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('muestra la descripción correspondiente a Weak', () => {
    render(<ProofScoreBadge label="Weak" />)
    expect(screen.getByText(/señal débil/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: variante compact
// ---------------------------------------------------------------------------

describe('ProofScoreBadge — variante compact', () => {
  it('no muestra la descripción en variante compact', () => {
    render(<ProofScoreBadge label="Promising" variant="compact" />)
    expect(screen.queryByText(/el equipo ve potencial real/i)).not.toBeInTheDocument()
  })

  it('sigue mostrando el label en variante compact', () => {
    render(<ProofScoreBadge label="Promising" variant="compact" />)
    expect(screen.getByText('Promising')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: variante full (default)
// ---------------------------------------------------------------------------

describe('ProofScoreBadge — variante full (default)', () => {
  it('muestra la descripción en variante full', () => {
    render(<ProofScoreBadge label="Weak" variant="full" />)
    expect(screen.getByText(/señal débil/i)).toBeInTheDocument()
  })

  it('muestra la descripción cuando no se especifica variant (default = full)', () => {
    render(<ProofScoreBadge label="Needs iteration" />)
    expect(screen.getByText(/la solución genera dudas/i)).toBeInTheDocument()
  })
})
