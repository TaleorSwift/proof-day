// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — WizardStepHypothesis (Story 10.5)
 * T1.1–T1.4: componente renderiza bloque de hipótesis, textarea, refleja valor, llama onChange
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { WizardStepHypothesis } from '@/components/projects/wizard/WizardStepHypothesis'
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
  customQuestion: '',
}

const DEFAULT_PROPS = {
  data: EMPTY_FORM_DATA,
  onChange: vi.fn(),
}

// ── T1.1: renderiza el textarea ───────────────────────────────────────────────

describe('WizardStepHypothesis — T1.1: renderiza el campo textarea', () => {
  it('renderiza el textarea con data-testid="wizard-field-hypothesis"', () => {
    render(<WizardStepHypothesis {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-hypothesis')).toBeInTheDocument()
  })

  it('el textarea tiene placeholder "Si [acción], entonces [resultado]…"', () => {
    render(<WizardStepHypothesis {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-hypothesis')).toHaveAttribute(
      'placeholder',
      'Si [acción], entonces [resultado]…',
    )
  })

  it('renderiza el label "Hipótesis a validar"', () => {
    render(<WizardStepHypothesis {...DEFAULT_PROPS} />)
    expect(screen.getByText(/hipótesis a validar/i)).toBeInTheDocument()
  })
})

// ── T1.2: bloque visual de hipótesis ─────────────────────────────────────────

describe('WizardStepHypothesis — T1.2: bloque visual de hipótesis', () => {
  it('renderiza el bloque con data-testid="hypothesis-block"', () => {
    render(<WizardStepHypothesis {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('hypothesis-block')).toBeInTheDocument()
  })
})

// ── T1.3: valor de data.hypothesis se muestra ─────────────────────────────────

describe('WizardStepHypothesis — T1.3: valor inicial de hypothesis', () => {
  it('muestra el valor de data.hypothesis en el textarea', () => {
    const data: WizardFormData = { ...EMPTY_FORM_DATA, hypothesis: 'Si el usuario ve el precio, compra' }
    render(<WizardStepHypothesis data={data} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-hypothesis')).toHaveValue(
      'Si el usuario ve el precio, compra',
    )
  })

  it('el textarea está vacío cuando data.hypothesis es ""', () => {
    render(<WizardStepHypothesis {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-hypothesis')).toHaveValue('')
  })
})

// ── T1.4: onChange se llama con el nuevo valor ────────────────────────────────

describe('WizardStepHypothesis — T1.4: onChange', () => {
  it('llama a onChange con { hypothesis: nuevValor } al escribir en el textarea', () => {
    const onChange = vi.fn()
    render(<WizardStepHypothesis data={EMPTY_FORM_DATA} onChange={onChange} />)
    fireEvent.change(screen.getByTestId('wizard-field-hypothesis'), {
      target: { value: 'Nueva hipótesis' },
    })
    expect(onChange).toHaveBeenCalledWith({ hypothesis: 'Nueva hipótesis' })
  })
})
