// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — WizardStepDetails — campo custom_question (Story 11.2)
 * T1.1–T1.4: campo visible, contador, color error, onChange
 * AC-1, AC-2, AC-3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { WizardStepDetails } from '@/components/projects/wizard/WizardStepDetails'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

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

// ── T1.1: campo visible en el DOM ─────────────────────────────────────────────

describe('WizardStepDetails — T1.1: campo custom_question visible', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza el campo con data-testid="wizard-field-custom-question"', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-custom-question')).toBeInTheDocument()
  })

  it('muestra el label "Pregunta para los Reviewers (opcional)"', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(
      screen.getByText('Pregunta para los Reviewers (opcional)'),
    ).toBeInTheDocument()
  })

  it('tiene el placeholder correcto', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-custom-question')).toHaveAttribute(
      'placeholder',
      '¿Echarías en falta esta funcionalidad si desapareciera mañana?',
    )
  })
})

// ── T1.2: contador de caracteres visible (formato "0/200") ────────────────────

describe('WizardStepDetails — T1.2: contador de caracteres', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra el contador "0/200" cuando el campo está vacío', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-custom-question-counter')).toHaveTextContent('0/200')
  })

  it('actualiza el contador al mostrar un valor inicial de 50 caracteres', () => {
    const longText = 'a'.repeat(50)
    const data: WizardFormData = { ...EMPTY_FORM_DATA, customQuestion: longText }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    expect(screen.getByTestId('wizard-custom-question-counter')).toHaveTextContent('50/200')
  })
})

// ── T1.3: contador cambia a color error cuando length > 200 ───────────────────

describe('WizardStepDetails — T1.3: color de error cuando excede 200 chars', () => {
  beforeEach(() => vi.clearAllMocks())

  it('el campo muestra borde rojo cuando el texto supera 200 caracteres', () => {
    const exceededText = 'a'.repeat(201)
    const data: WizardFormData = { ...EMPTY_FORM_DATA, customQuestion: exceededText }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    const textarea = screen.getByTestId('wizard-field-custom-question')
    // El borde rojo se aplica via inline style — verificamos el data-error attr o la clase
    expect(textarea).toHaveAttribute('data-error', 'true')
  })

  it('el contador muestra color de error cuando supera 200 caracteres', () => {
    const exceededText = 'a'.repeat(201)
    const data: WizardFormData = { ...EMPTY_FORM_DATA, customQuestion: exceededText }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    expect(screen.getByTestId('wizard-custom-question-counter')).toHaveAttribute(
      'data-error',
      'true',
    )
  })

  it('el campo NO tiene error cuando el texto tiene exactamente 200 caracteres', () => {
    const maxText = 'a'.repeat(200)
    const data: WizardFormData = { ...EMPTY_FORM_DATA, customQuestion: maxText }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    const textarea = screen.getByTestId('wizard-field-custom-question')
    expect(textarea).not.toHaveAttribute('data-error', 'true')
  })
})

// ── T1.4: onChange se llama con { customQuestion: value } ────────────────────

describe('WizardStepDetails — T1.4: onChange con customQuestion', () => {
  it('llama a onChange con { customQuestion: value } al teclear', () => {
    const onChange = vi.fn()
    render(<WizardStepDetails data={EMPTY_FORM_DATA} onChange={onChange} />)
    const textarea = screen.getByTestId('wizard-field-custom-question')
    fireEvent.change(textarea, { target: { value: '¿Lo usarías en producción?' } })
    expect(onChange).toHaveBeenCalledWith({ customQuestion: '¿Lo usarías en producción?' })
  })
})

// ── Persistencia del valor desde data ────────────────────────────────────────

describe('WizardStepDetails — persistencia de customQuestion desde data', () => {
  it('muestra el valor de data.customQuestion en el textarea', () => {
    const data: WizardFormData = {
      ...EMPTY_FORM_DATA,
      customQuestion: '¿Qué mejorarías primero?',
    }
    render(<WizardStepDetails data={data} onChange={vi.fn()} />)
    expect(screen.getByTestId('wizard-field-custom-question')).toHaveValue(
      '¿Qué mejorarías primero?',
    )
  })
})
