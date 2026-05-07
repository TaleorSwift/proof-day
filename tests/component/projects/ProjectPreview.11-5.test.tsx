// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — ProjectPreview (Story 11.5)
 * Gate de reciprocidad: banner bloqueante, botón deshabilitado, mensajes plurales
 * AC-5, AC-6
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { WizardFormData } from '@/components/projects/ProjectWizard'
import type { ReciprocityGate } from '@/lib/utils/reciprocity'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FORM_DATA: WizardFormData = {
  templateId: null,
  selectedTemplate: null,
  title: 'Pulse Check',
  tagline: 'Valida tu idea en horas',
  problem: 'Los builders no saben qué construir',
  solution: 'Un wizard guiado paso a paso',
  targetUser: '',
  demoLink: '',
  feedbackTopics: [],
  images: [],
  hypothesis: '',
  customQuestion: '',
}

const DEFAULT_PROPS = {
  data: FORM_DATA,
  onEdit: vi.fn(),
  onPublish: vi.fn(),
  isPublishing: false,
}

// ── AC-6: sin prop reciprocityGate → flujo normal ─────────────────────────────

describe('ProjectPreview — AC-6: sin reciprocityGate → flujo normal', () => {
  it('el botón "Publicar" está habilitado cuando no se pasa reciprocityGate', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    const btn = screen.getByTestId('preview-publish-btn')
    expect(btn).not.toBeDisabled()
  })

  it('NO aparece el banner reciprocity-gate-message cuando no se pasa reciprocityGate', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.queryByTestId('reciprocity-gate-message')).not.toBeInTheDocument()
  })

  it('el botón está habilitado con reciprocityGate blocked=false', () => {
    const gate: ReciprocityGate = { blocked: false, given: 5, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.getByTestId('preview-publish-btn')).not.toBeDisabled()
  })

  it('NO aparece el banner con reciprocityGate blocked=false', () => {
    const gate: ReciprocityGate = { blocked: false, given: 5, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.queryByTestId('reciprocity-gate-message')).not.toBeInTheDocument()
  })
})

// ── AC-5: con reciprocityGate blocked=true → botón deshabilitado + banner ────

describe('ProjectPreview — AC-5: reciprocityGate blocked=true → botón disabled + banner', () => {
  it('el botón "Publicar" está deshabilitado cuando blocked=true', () => {
    const gate: ReciprocityGate = { blocked: true, given: 2, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.getByTestId('preview-publish-btn')).toBeDisabled()
  })

  it('aparece el banner data-testid="reciprocity-gate-message" cuando blocked=true', () => {
    const gate: ReciprocityGate = { blocked: true, given: 2, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.getByTestId('reciprocity-gate-message')).toBeInTheDocument()
  })

  it('el banner muestra el mensaje correcto con singular (falta 1 feedback)', () => {
    const gate: ReciprocityGate = { blocked: true, given: 2, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.getByTestId('reciprocity-gate-message')).toHaveTextContent(
      'Necesitas dar 1 feedback más antes de publicar. Has dado 2 de 3 requeridos.',
    )
  })

  it('el banner muestra el mensaje correcto con plural (faltan 3 feedbacks)', () => {
    const gate: ReciprocityGate = { blocked: true, given: 0, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} reciprocityGate={gate} />)
    expect(screen.getByTestId('reciprocity-gate-message')).toHaveTextContent(
      'Necesitas dar 3 feedbacks más antes de publicar. Has dado 0 de 3 requeridos.',
    )
  })

  it('el botón está deshabilitado incluso cuando isPublishing=false y blocked=true', () => {
    const gate: ReciprocityGate = { blocked: true, given: 1, required: 3 }
    render(<ProjectPreview {...DEFAULT_PROPS} isPublishing={false} reciprocityGate={gate} />)
    expect(screen.getByTestId('preview-publish-btn')).toBeDisabled()
  })
})
