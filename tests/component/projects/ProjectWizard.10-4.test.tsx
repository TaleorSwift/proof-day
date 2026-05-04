// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — ProjectWizard paso 5 preview (Story 10.4)
 * T7.4: navegación llega al paso 5 (wizard-step-5)
 * T7.5: indicador de progreso muestra "1 de 5" en paso 1
 * AC-7: total de pasos = 5
 * AC-8: no hay botón "+ Lanzar proyecto" en el paso 3 (submit temporal eliminado)
 * AC-4: onEdit en paso 5 regresa al paso 4 (hipótesis)
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

function fillStep2RequiredFields() {
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
}

function navigateToStep5() {
  // Paso 1 → Paso 2
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Rellenar paso 2
  fillStep2RequiredFields()

  // Paso 2 → Paso 3
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Paso 3 → Paso 4
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Paso 4 → Paso 5
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
}

// ── AC-7: total de pasos = 5 ──────────────────────────────────────────────────

describe('ProjectWizard — AC-7 (Story 10.4): total de pasos = 5', () => {
  it('el indicador de progreso muestra "1 de 5" en el paso 1', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('1')
    expect(progress).toHaveTextContent('5')
  })

  it('el indicador de progreso muestra "5 de 5" en el paso 5', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('5')
  })
})

// ── T7.4: navegación al paso 5 ───────────────────────────────────────────────

describe('ProjectWizard — T7.4 (Story 10.4): navegación al paso 5', () => {
  it('navega al paso 5 (preview) desde el paso 4 (hipótesis)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    expect(screen.getByTestId('wizard-step-5')).toBeInTheDocument()
  })

  it('el paso 5 muestra el banner de reviewer', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    expect(screen.getByTestId('preview-reviewer-banner')).toBeInTheDocument()
  })

  it('el paso 5 NO tiene botón "Continuar"', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    expect(screen.queryByRole('button', { name: /continuar/i })).not.toBeInTheDocument()
  })

  it('el paso 5 tiene botón "Publicar"', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument()
  })
})

// ── AC-4: onEdit regresa al paso 4 ───────────────────────────────────────────

describe('ProjectWizard — AC-4 (Story 10.4): Editar regresa al paso 4', () => {
  it('al hacer click en Editar desde paso 5 regresa al paso 4 (hipótesis)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    navigateToStep5()
    fireEvent.click(screen.getByTestId('preview-edit-btn'))
    expect(screen.getByTestId('wizard-step-4')).toBeInTheDocument()
  })
})

// ── AC-8: sin botón "Lanzar proyecto" en paso 3 ──────────────────────────────

describe('ProjectWizard — AC-8 (Story 10.4): submit temporal eliminado en paso 3', () => {
  it('el paso 3 NO tiene botón "+ Lanzar proyecto"', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)

    // Paso 1 → 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()

    // Paso 2 → 3
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(screen.queryByRole('button', { name: /lanzar proyecto/i })).not.toBeInTheDocument()
  })

  it('el paso 3 tiene botón "Continuar" para avanzar al paso 4', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)

    // Paso 1 → 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()

    // Paso 2 → 3
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // En el paso 3 debe haber un botón Continuar
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
  })
})

// ── AC-9: submit desde paso 5 llama a onSubmit ───────────────────────────────

describe('ProjectWizard — AC-9 (Story 10.4): publicar desde paso 5', () => {
  it('al hacer click en Publicar desde paso 5 llama a onSubmit con los datos del wizard', () => {
    const onSubmit = vi.fn()
    render(<ProjectWizard {...DEFAULT_PROPS} onSubmit={onSubmit} />)
    navigateToStep5()

    fireEvent.click(screen.getByRole('button', { name: /publicar/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Pulse Check',
        tagline: 'Valida tu idea en horas',
        problem: 'Los builders no saben qué construir',
        solution: 'Un wizard guiado paso a paso',
      }),
    )
  })

  it('el botón "Publicar" está deshabilitado cuando isPublishing/isSubmitting=true', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} isSubmitting={true} />)
    navigateToStep5()
    expect(screen.getByRole('button', { name: /publicando/i })).toBeDisabled()
  })
})
