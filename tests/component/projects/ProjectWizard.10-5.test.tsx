// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — ProjectWizard paso 4 hipótesis (Story 10.5)
 * T7.2: indicador muestra "1 de 4"
 * T7.3: navegación llega al paso 4
 * T7.4: datos de hypothesis conservados al navegar
 * AC-3: botón Continuar siempre habilitado en paso 4
 * AC-4: total de pasos = 4
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { ProjectWizard } from '@/components/projects/ProjectWizard'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  templates: [],
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

function navigateToStep4() {
  // Paso 1 → Paso 2
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Rellenar paso 2 (campos requeridos)
  fireEvent.change(screen.getByTestId('wizard-field-title'), {
    target: { value: 'Pulse Check' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-tagline'), {
    target: { value: 'Valida tu idea en horas' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-problem'), {
    target: { value: 'Los builders no saben qué construir' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-solution'), {
    target: { value: 'Un wizard guiado paso a paso' },
  })

  // Paso 2 → Paso 3
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Paso 3 → Paso 4 (usando el botón Continuar de la barra de navegación)
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
}

// ── AC-4: total de pasos = 4 ──────────────────────────────────────────────────

describe('ProjectWizard — AC-4 (Story 10.5): total de pasos = 4', () => {
  it('el indicador de progreso muestra "1 de 4" en el paso 1', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('1')
    expect(progress).toHaveTextContent('4')
  })
})

// ── T7.3: navegación al paso 4 ───────────────────────────────────────────────

describe('ProjectWizard — T7.3 (Story 10.5): navegación al paso 4', () => {
  it('navega al paso 4 (hipótesis) desde el paso 3', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    expect(screen.getByTestId('wizard-step-4')).toBeInTheDocument()
  })

  it('el indicador de progreso muestra "4 de 4" en el paso 4', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('4')
  })

  it('el paso 4 muestra el bloque de hipótesis', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    expect(screen.getByTestId('hypothesis-block')).toBeInTheDocument()
  })

  it('el paso 4 muestra el textarea de hipótesis', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    expect(screen.getByTestId('wizard-field-hypothesis')).toBeInTheDocument()
  })

  it('el botón "Anterior" está presente en el paso 4', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument()
  })

  it('regresa al paso 3 al hacer click en "Anterior" desde el paso 4', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(screen.getByTestId('wizard-step-3')).toBeInTheDocument()
  })
})

// ── AC-3: Continuar habilitado en paso 4 ─────────────────────────────────────

describe('ProjectWizard — AC-3 (Story 10.5): paso 4 siempre habilitado', () => {
  it('el paso 4 no muestra botón Continuar (es el último paso)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()
    // El paso 4 es el último paso — no hay botón Continuar
    expect(screen.queryByRole('button', { name: /continuar/i })).not.toBeInTheDocument()
  })
})

// ── AC-2: datos de hypothesis conservados ────────────────────────────────────

describe('ProjectWizard — AC-2 (Story 10.5): datos hypothesis conservados', () => {
  it('el valor de hypothesis se conserva al navegar al paso anterior y volver', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep4()

    // Escribir hypothesis
    fireEvent.change(screen.getByTestId('wizard-field-hypothesis'), {
      target: { value: 'Si el usuario ve el precio, compra más' },
    })

    // Volver al paso 3
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(screen.getByTestId('wizard-step-3')).toBeInTheDocument()

    // Avanzar de nuevo al paso 4
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // El valor debe estar conservado
    expect(screen.getByTestId('wizard-field-hypothesis')).toHaveValue(
      'Si el usuario ve el precio, compra más',
    )
  })
})
