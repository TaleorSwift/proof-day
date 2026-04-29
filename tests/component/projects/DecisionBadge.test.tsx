// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { DecisionBadge } from '@/components/projects/DecisionBadge'

// ---------------------------------------------------------------------------
// Suite: DecisionBadge — modo normal (compact=false por defecto)
// ---------------------------------------------------------------------------

describe('DecisionBadge — modo normal', () => {
  it('renderiza el label "Iterar" para la decisión iterate', () => {
    render(<DecisionBadge decision="iterate" />)
    expect(screen.getByText('Iterar')).toBeInTheDocument()
  })

  it('renderiza la descripción "Refinando la propuesta" para iterate', () => {
    render(<DecisionBadge decision="iterate" />)
    expect(screen.getByText('Refinando la propuesta')).toBeInTheDocument()
  })

  it('renderiza el label "Escalar" para la decisión scale', () => {
    render(<DecisionBadge decision="scale" />)
    expect(screen.getByText('Escalar')).toBeInTheDocument()
  })

  it('renderiza la descripción "Llevando la idea adelante" para scale', () => {
    render(<DecisionBadge decision="scale" />)
    expect(screen.getByText('Llevando la idea adelante')).toBeInTheDocument()
  })

  it('renderiza el label "Abandonar" para la decisión abandon', () => {
    render(<DecisionBadge decision="abandon" />)
    expect(screen.getByText('Abandonar')).toBeInTheDocument()
  })

  it('renderiza la descripción "Desarrollo detenido" para abandon', () => {
    render(<DecisionBadge decision="abandon" />)
    expect(screen.getByText('Desarrollo detenido')).toBeInTheDocument()
  })

  it('oculta el icono del árbol de accesibilidad con aria-hidden', () => {
    render(<DecisionBadge decision="iterate" />)
    const iconSpans = document.querySelectorAll('[aria-hidden="true"]')
    expect(iconSpans.length).toBeGreaterThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// Suite: DecisionBadge — modo compacto (compact=true)
// ---------------------------------------------------------------------------

describe('DecisionBadge — modo compacto', () => {
  it('renderiza el label "Iterar" en modo compacto', () => {
    render(<DecisionBadge decision="iterate" compact />)
    expect(screen.getByText('Iterar')).toBeInTheDocument()
  })

  it('renderiza el label "Escalar" en modo compacto', () => {
    render(<DecisionBadge decision="scale" compact />)
    expect(screen.getByText('Escalar')).toBeInTheDocument()
  })

  it('renderiza el label "Abandonar" en modo compacto', () => {
    render(<DecisionBadge decision="abandon" compact />)
    expect(screen.getByText('Abandonar')).toBeInTheDocument()
  })

  it('no renderiza la descripción en modo compacto', () => {
    render(<DecisionBadge decision="iterate" compact />)
    expect(screen.queryByText('Refinando la propuesta')).not.toBeInTheDocument()
  })

  it('renderiza como span inline en modo compacto', () => {
    const { container } = render(<DecisionBadge decision="iterate" compact />)
    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
  })
})
