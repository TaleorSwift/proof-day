// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — WizardStepDetails (Story 10.3)
 * T4.3: campos opcionales, botón siempre activo
 * AC-3: paso 3 con todos los campos opcionales — botón habilitado
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { WizardStepDetails } from '@/components/projects/wizard/WizardStepDetails'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Mocks ──────────────────────────────────────────────────────────────────────

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
}

const DEFAULT_PROPS = {
  data: EMPTY_FORM_DATA,
  onChange: vi.fn(),
  // Story 10.4: onSubmit eliminado de WizardStepDetails — submit en paso 5 (ProjectPreview)
}

// ── T4.1: campos opcionales ───────────────────────────────────────────────────

describe('WizardStepDetails — T4.1: campos opcionales', () => {
  it('renderiza el campo targetUser', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-target-user')).toBeInTheDocument()
  })

  it('renderiza el campo demoLink', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('wizard-field-demo-link')).toBeInTheDocument()
  })

  it('renderiza los chips de feedback', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-feedback-chips')).toBeInTheDocument()
  })

  it('renderiza el uploader de imágenes', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('modal-field-images')).toBeInTheDocument()
  })
})

// ── T4.2: sin botón submit (Story 10.4 lo eliminó) ──────────────────────────

describe('WizardStepDetails — T4.2: sin botón de submit (Story 10.4)', () => {
  it('NO renderiza botón "+ Lanzar proyecto" (submit eliminado en Story 10.4)', () => {
    render(<WizardStepDetails {...DEFAULT_PROPS} />)
    // Story 10.4: el submit ocurre en el paso 5 (ProjectPreview)
    expect(screen.queryByRole('button', { name: /lanzar proyecto/i })).not.toBeInTheDocument()
  })
})

// ── Valores iniciales ─────────────────────────────────────────────────────────

describe('WizardStepDetails — valores iniciales desde data', () => {
  it('muestra el valor de data.targetUser', () => {
    const data: WizardFormData = { ...EMPTY_FORM_DATA, targetUser: 'Developers' }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    expect(screen.getByTestId('wizard-field-target-user')).toHaveValue('Developers')
  })

  it('muestra el valor de data.demoLink', () => {
    const data: WizardFormData = { ...EMPTY_FORM_DATA, demoLink: 'https://demo.com' }
    render(<WizardStepDetails {...DEFAULT_PROPS} data={data} />)
    expect(screen.getByTestId('wizard-field-demo-link')).toHaveValue('https://demo.com')
  })
})
