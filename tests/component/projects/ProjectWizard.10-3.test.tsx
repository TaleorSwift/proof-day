// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — ProjectWizard (Story 10.3)
 * T1.7: navegación entre pasos, datos conservados al regresar,
 *        botón Continuar habilitado/deshabilitado
 * AC-2: datos conservados al regresar al paso 2 desde paso 3
 * AC-3: Continuar habilitado en paso 3 (todos los campos opcionales)
 * AC-4: responsive — el indicador de progreso es visible
 * AC-5: sin template, sin hints de ejemplo
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { ProjectWizard } from '@/components/projects/ProjectWizard'
import { ALL_TEMPLATES, TEMPLATE_SAAS } from '@/lib/fixtures/templates'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  templates: [] as typeof ALL_TEMPLATES,
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
    target: { value: 'Los builders no saben qué construir primero' },
  })
  fireEvent.change(screen.getByTestId('wizard-field-solution'), {
    target: { value: 'Un modal rápido para lanzar ideas' },
  })
}

// ── T1: Estructura y navegación del wizard ────────────────────────────────────

describe('ProjectWizard — T1: estructura y navegación', () => {
  it('renderiza el indicador de progreso con el total de pasos', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-progress')).toBeInTheDocument()
  })

  it('empieza en el paso 1 (selector de tipo)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-step-1')).toBeInTheDocument()
  })

  it('el botón "Anterior" no es visible en el paso 1', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument()
  })

  it('el botón "Continuar" está siempre habilitado en el paso 1 (template es opcional)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    const btn = screen.getByRole('button', { name: /continuar/i })
    expect(btn).not.toBeDisabled()
  })

  it('navega al paso 2 al hacer click en "Continuar" desde el paso 1', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-step-2')).toBeInTheDocument()
  })

  it('el botón "Anterior" es visible en el paso 2', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument()
  })

  it('regresa al paso 1 al hacer click en "Anterior" desde el paso 2', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }))
    expect(screen.getByTestId('wizard-step-1')).toBeInTheDocument()
  })

  it('navega al paso 3 desde el paso 2 cuando los campos requeridos están rellenos', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-step-3')).toBeInTheDocument()
  })

  it('el botón "Continuar" está deshabilitado en el paso 2 si title está vacío', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    // Sin rellenar campos — Continuar debe estar deshabilitado
    expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled()
  })

  it('el botón "Continuar" se habilita en el paso 2 cuando todos los campos requeridos tienen contenido', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()
    expect(screen.getByRole('button', { name: /continuar/i })).not.toBeDisabled()
  })
})

// ── AC-2: datos conservados al navegar entre pasos ────────────────────────────

describe('ProjectWizard — AC-2: datos conservados al regresar', () => {
  it('los datos de paso 2 se conservan al regresar desde paso 3', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)

    // Paso 1 → Paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // Rellenar paso 2
    fillStep2RequiredFields()

    // Paso 2 → Paso 3
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // Paso 3 → Paso 2 (Anterior)
    fireEvent.click(screen.getByRole('button', { name: /anterior/i }))

    // Los valores deben estar conservados
    expect(screen.getByTestId('wizard-field-title')).toHaveValue('Pulse Check')
    expect(screen.getByTestId('wizard-field-problem')).toHaveValue(
      'Los builders no saben qué construir primero',
    )
    expect(screen.getByTestId('wizard-field-solution')).toHaveValue(
      'Un modal rápido para lanzar ideas',
    )
  })
})

// ── AC-3: Continuar habilitado en paso 3 (campos opcionales) ──────────────────

describe('ProjectWizard — AC-3: paso 3 Publicar siempre habilitado', () => {
  it('"Publicar" está habilitado en el paso 3 sin rellenar ningún campo opcional', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)

    // Paso 1 → Paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // Rellenar paso 2 (requerido para llegar a paso 3)
    fillStep2RequiredFields()

    // Paso 2 → Paso 3
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // En paso 3, el botón de publicar debe estar habilitado
    expect(screen.getByRole('button', { name: /lanzar proyecto/i })).not.toBeDisabled()
  })
})

// ── AC-4: indicador de progreso visible ──────────────────────────────────────

describe('ProjectWizard — AC-4: indicador de progreso', () => {
  // Story 10.5: wizard ahora tiene 4 pasos (se añadió paso de hipótesis)
  it('el indicador muestra los números de paso al inicio (1 de 4)', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('1')
    expect(progress).toHaveTextContent('4')
  })

  it('el indicador muestra el número de paso actualizado al navegar a paso 2', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    const progress = screen.getByTestId('wizard-progress')
    expect(progress).toHaveTextContent('2')
    expect(progress).toHaveTextContent('4')
  })

  it('muestra el label del paso actual (Tipo de proyecto) en paso 1', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-progress')).toHaveTextContent('Tipo de proyecto')
  })
})

// ── AC-5: sin template, sin hint de ejemplo ───────────────────────────────────

describe('ProjectWizard — AC-5: sin template, sin ejemplos contextuales', () => {
  it('los campos de descripción no muestran hints si no hay template seleccionado', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} templates={ALL_TEMPLATES} />)

    // Continuar sin seleccionar template (paso 1 → paso 2)
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // No debe haber ningún elemento con prefijo "Ejemplo:"
    expect(screen.queryByText(/^Ejemplo:/)).not.toBeInTheDocument()
  })
})

// ── onSubmit ─────────────────────────────────────────────────────────────────

describe('ProjectWizard — submit desde paso 3', () => {
  it('llama a onSubmit al hacer click en "+ Lanzar proyecto" en el paso 3', () => {
    const onSubmit = vi.fn()
    render(<ProjectWizard {...DEFAULT_PROPS} onSubmit={onSubmit} />)

    // Paso 1 → Paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()

    // Paso 2 → Paso 3
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // Submit en paso 3
    fireEvent.click(screen.getByRole('button', { name: /lanzar proyecto/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('onSubmit recibe los datos del wizard incluyendo los del paso 2', () => {
    const onSubmit = vi.fn()
    render(<ProjectWizard {...DEFAULT_PROPS} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fillStep2RequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    fireEvent.click(screen.getByRole('button', { name: /lanzar proyecto/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Pulse Check',
        tagline: 'Valida tu idea en horas',
        problem: 'Los builders no saben qué construir primero',
        solution: 'Un modal rápido para lanzar ideas',
      }),
    )
  })
})

// ── Selección de template en paso 1 pasa datos a paso 2 ──────────────────────

describe('ProjectWizard — T2: template seleccionado en paso 1 se propaga a paso 2', () => {
  it('tras seleccionar SaaS en paso 1 y avanzar, paso 2 muestra hints de SaaS', () => {
    render(<ProjectWizard {...DEFAULT_PROPS} templates={ALL_TEMPLATES} />)

    // Seleccionar SaaS
    fireEvent.click(screen.getByRole('button', { name: /saas/i }))

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // Debe mostrar el hint de problema de SaaS
    expect(
      screen.getByText(
        `Ejemplo: ${TEMPLATE_SAAS.descriptionStructure.problem.example}`,
      ),
    ).toBeInTheDocument()
  })
})
