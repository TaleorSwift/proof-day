// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — WizardStepDescription con botón "Sugerir con IA" (Story 13.7)
 * AC7: WizardStepDescription muestra botón "Sugerir con IA" junto a problema/solución
 *      cuando hay título; botón deshabilitado cuando título está vacío.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { WizardStepDescription } from '@/components/projects/wizard/WizardStepDescription'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

const DATA_WITH_TITLE: WizardFormData = {
  ...EMPTY_FORM_DATA,
  title: 'Mi proyecto',
}

// ---------------------------------------------------------------------------
// Suite — AC7: botones "Sugerir con IA" en campo problema
// ---------------------------------------------------------------------------

describe('WizardStepDescription — AC7: botón "Sugerir con IA" para problema', () => {
  it('renderiza el botón de sugerir para problema cuando data.title tiene valor', () => {
    render(<WizardStepDescription data={DATA_WITH_TITLE} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-problem')).toBeInTheDocument()
  })

  it('el botón de problema está habilitado cuando data.title tiene valor', () => {
    render(<WizardStepDescription data={DATA_WITH_TITLE} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-problem')).not.toBeDisabled()
  })

  it('el botón de problema está deshabilitado cuando data.title está vacío', () => {
    render(<WizardStepDescription data={EMPTY_FORM_DATA} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-problem')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite — AC7: botones "Sugerir con IA" en campo solución
// ---------------------------------------------------------------------------

describe('WizardStepDescription — AC7: botón "Sugerir con IA" para solución', () => {
  it('renderiza el botón de sugerir para solución cuando data.title tiene valor', () => {
    render(<WizardStepDescription data={DATA_WITH_TITLE} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-solution')).toBeInTheDocument()
  })

  it('el botón de solución está habilitado cuando data.title tiene valor', () => {
    render(<WizardStepDescription data={DATA_WITH_TITLE} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-solution')).not.toBeDisabled()
  })

  it('el botón de solución está deshabilitado cuando data.title está vacío', () => {
    render(<WizardStepDescription data={EMPTY_FORM_DATA} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-solution')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Suite — ambos botones presentes simultáneamente
// ---------------------------------------------------------------------------

describe('WizardStepDescription — AC7: ambos botones de IA presentes', () => {
  it('renderiza ambos botones (problema y solución) cuando hay título', () => {
    render(<WizardStepDescription data={DATA_WITH_TITLE} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-problem')).toBeInTheDocument()
    expect(screen.getByTestId('ai-suggest-solution')).toBeInTheDocument()
  })

  it('ambos botones están deshabilitados cuando no hay título', () => {
    render(<WizardStepDescription data={EMPTY_FORM_DATA} onChange={vi.fn()} />)
    expect(screen.getByTestId('ai-suggest-problem')).toBeDisabled()
    expect(screen.getByTestId('ai-suggest-solution')).toBeDisabled()
  })
})
