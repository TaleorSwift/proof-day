// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — WizardStepDescription (Story 10.3)
 * T3.6: campos con template muestran hint; sin template no muestran hint;
 *        navegación conserva datos
 * AC-1: hints de ejemplo contextuales con template
 * AC-5: sin template, sin hints
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { WizardStepDescription } from '@/components/projects/wizard/WizardStepDescription'
import { TEMPLATE_SAAS } from '@/lib/fixtures/templates'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_FORM_DATA: WizardFormData = {
  templateId: null,
  selectedTemplate: null,
  title: '',
  tagline: '',
  problem: '',
  solution: '',
  targetUser: '',
  demoLink: '',
  feedbackTopics: [],
  images: [],
  hypothesis: '',
}

const DEFAULT_PROPS = {
  data: EMPTY_FORM_DATA,
  onChange: vi.fn(),
}

// ── AC-5: sin template, sin ejemplos ─────────────────────────────────────────

describe('WizardStepDescription — AC-5: sin template seleccionado', () => {
  it('renderiza los cuatro campos requeridos', () => {
    render(<WizardStepDescription {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-title')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-field-tagline')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-field-problem')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-field-solution')).toBeInTheDocument()
  })

  it('no muestra hints de ejemplo cuando no hay template seleccionado', () => {
    render(<WizardStepDescription {...DEFAULT_PROPS} />)
    expect(screen.queryByText(/^Ejemplo:/)).not.toBeInTheDocument()
  })

  it('usa el placeholder genérico para problema sin template', () => {
    render(<WizardStepDescription {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-problem')).toHaveAttribute(
      'placeholder',
      '¿Qué problema resuelves?',
    )
  })

  it('usa el placeholder genérico para solución sin template', () => {
    render(<WizardStepDescription {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-solution')).toHaveAttribute(
      'placeholder',
      '¿Cuál es tu solución propuesta?',
    )
  })
})

// ── AC-1: con template, placeholders dinámicos y ejemplos ─────────────────────

describe('WizardStepDescription — AC-1: con template seleccionado', () => {
  const dataConTemplate: WizardFormData = {
    ...EMPTY_FORM_DATA,
    templateId: TEMPLATE_SAAS.id,
    selectedTemplate: TEMPLATE_SAAS,
  }

  it('muestra el hint de problema del template (prefijo "Ejemplo: ")', () => {
    render(<WizardStepDescription data={dataConTemplate} onChange={vi.fn()} />)
    expect(
      screen.getByText(`Ejemplo: ${TEMPLATE_SAAS.descriptionStructure.problem.example}`),
    ).toBeInTheDocument()
  })

  it('muestra el hint de solución del template (prefijo "Ejemplo: ")', () => {
    render(<WizardStepDescription data={dataConTemplate} onChange={vi.fn()} />)
    expect(
      screen.getByText(`Ejemplo: ${TEMPLATE_SAAS.descriptionStructure.solution.example}`),
    ).toBeInTheDocument()
  })

  it('el hint de problema tiene color --color-text-muted', () => {
    render(<WizardStepDescription data={dataConTemplate} onChange={vi.fn()} />)
    const hintProblem = screen.getByTestId('wizard-hint-problem')
    expect(hintProblem).toHaveStyle({ color: 'var(--color-text-muted)' })
  })

  it('usa el placeholder del template para problema', () => {
    render(<WizardStepDescription data={dataConTemplate} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-problem')).toHaveAttribute(
      'placeholder',
      TEMPLATE_SAAS.descriptionStructure.problem.placeholder,
    )
  })

  it('usa el placeholder del template para solución', () => {
    render(<WizardStepDescription data={dataConTemplate} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-solution')).toHaveAttribute(
      'placeholder',
      TEMPLATE_SAAS.descriptionStructure.solution.placeholder,
    )
  })
})

// ── onChange: notifica cambios al padre ──────────────────────────────────────

describe('WizardStepDescription — onChange', () => {
  it('llama a onChange con el campo title actualizado', () => {
    const onChange = vi.fn()
    render(<WizardStepDescription data={EMPTY_FORM_DATA} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('wizard-field-title'), {
      target: { value: 'Mi proyecto' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Mi proyecto' }),
    )
  })

  it('llama a onChange con el campo problem actualizado', () => {
    const onChange = vi.fn()
    render(<WizardStepDescription data={EMPTY_FORM_DATA} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('wizard-field-problem'), {
      target: { value: 'El problema' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ problem: 'El problema' }),
    )
  })
})

// ── Valores iniciales desde data ─────────────────────────────────────────────

describe('WizardStepDescription — valores iniciales desde data', () => {
  it('muestra el valor de data.title en el campo title', () => {
    const data: WizardFormData = { ...EMPTY_FORM_DATA, title: 'Pulse Check' }
    render(<WizardStepDescription data={data} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-title')).toHaveValue('Pulse Check')
  })

  it('muestra el valor de data.problem en el campo problem', () => {
    const data: WizardFormData = { ...EMPTY_FORM_DATA, problem: 'El problema guardado' }
    render(<WizardStepDescription data={data} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-problem')).toHaveValue('El problema guardado')
  })
})
