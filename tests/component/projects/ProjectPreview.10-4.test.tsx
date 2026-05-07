// @vitest-environment jsdom
/**
 * Tests TDD Outside-In — ProjectPreview (Story 10.4)
 * T2.1–T2.13: banner, secciones read-only, hipótesis condicional, botones editar/publicar
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { WizardFormData } from '@/components/projects/ProjectWizard'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FULL_FORM_DATA: WizardFormData = {
  templateId: '11111111-0000-0000-0000-000000000001',
  selectedTemplate: null,
  title: 'Pulse Check',
  tagline: 'Valida tu idea en horas',
  problem: 'Los builders no saben qué construir',
  solution: 'Un wizard guiado paso a paso',
  targetUser: 'Founders',
  demoLink: '',
  feedbackTopics: [],
  images: [],
  hypothesis: 'Si el builder ve el preview, publica mejor',
  customQuestion: '',
}

const FORM_DATA_NO_HYPOTHESIS: WizardFormData = {
  ...FULL_FORM_DATA,
  hypothesis: '',
}

const DEFAULT_PROPS = {
  data: FULL_FORM_DATA,
  templateName: 'SaaS',
  onEdit: vi.fn(),
  onPublish: vi.fn(),
  isPublishing: false,
}

// ── T2.1–T2.2: Banner "Así verán tu proyecto los Reviewers" ──────────────────

describe('ProjectPreview — T2.1–T2.2: banner de reviewer', () => {
  it('renderiza el banner con data-testid="preview-reviewer-banner"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-reviewer-banner')).toBeInTheDocument()
  })

  it('el banner contiene el texto "Así verán tu proyecto los Reviewers"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(
      screen.getByTestId('preview-reviewer-banner'),
    ).toHaveTextContent('Así verán tu proyecto los Reviewers')
  })
})

// ── T2.3–T2.4: Pill de template ──────────────────────────────────────────────

describe('ProjectPreview — T2.3–T2.4: pill de template', () => {
  it('renderiza el pill con data-testid="preview-template-pill" cuando templateName está presente', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} templateName="SaaS" />)
    expect(screen.getByTestId('preview-template-pill')).toBeInTheDocument()
  })

  it('el pill muestra el templateName', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} templateName="SaaS" />)
    expect(screen.getByTestId('preview-template-pill')).toHaveTextContent('SaaS')
  })

  it('el pill NO se renderiza si templateName es undefined', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} templateName={undefined} />)
    expect(screen.queryByTestId('preview-template-pill')).not.toBeInTheDocument()
  })
})

// ── T2.5–T2.8: secciones read-only ──────────────────────────────────────────

describe('ProjectPreview — T2.5–T2.8: secciones de contenido', () => {
  it('muestra el título con data-testid="preview-title"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-title')).toHaveTextContent('Pulse Check')
  })

  it('muestra el tagline con data-testid="preview-tagline"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-tagline')).toHaveTextContent('Valida tu idea en horas')
  })

  it('muestra el problema con data-testid="preview-problem"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-problem')).toHaveTextContent('Los builders no saben qué construir')
  })

  it('muestra la solución con data-testid="preview-solution"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-solution')).toHaveTextContent('Un wizard guiado paso a paso')
  })
})

// ── T2.9–T2.10: hipótesis condicional ─────────────────────────────────────────

describe('ProjectPreview — T2.9–T2.10: hipótesis condicional', () => {
  it('muestra la hipótesis con data-testid="preview-hypothesis" cuando tiene contenido', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-hypothesis')).toBeInTheDocument()
    expect(screen.getByTestId('preview-hypothesis')).toHaveTextContent(
      'Si el builder ve el preview, publica mejor',
    )
  })

  it('NO muestra la hipótesis cuando data.hypothesis está vacío', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} data={FORM_DATA_NO_HYPOTHESIS} />)
    expect(screen.queryByTestId('preview-hypothesis')).not.toBeInTheDocument()
  })
})

// ── T2.11: botón Editar ───────────────────────────────────────────────────────

describe('ProjectPreview — T2.11: botón Editar', () => {
  it('renderiza el botón Editar con data-testid="preview-edit-btn"', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('preview-edit-btn')).toBeInTheDocument()
  })

  it('llama a onEdit al hacer click en Editar', () => {
    const onEdit = vi.fn()
    render(<ProjectPreview {...DEFAULT_PROPS} onEdit={onEdit} />)
    fireEvent.click(screen.getByTestId('preview-edit-btn'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})

// ── T2.12–T2.13: botón Publicar ──────────────────────────────────────────────

describe('ProjectPreview — T2.12–T2.13: botón Publicar', () => {
  it('el botón "Publicar" está habilitado y muestra "Publicar" cuando isPublishing=false', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} isPublishing={false} />)
    const btn = screen.getByRole('button', { name: /publicar/i })
    expect(btn).not.toBeDisabled()
    expect(btn).toHaveTextContent('Publicar')
  })

  it('el botón está deshabilitado y muestra "Publicando..." cuando isPublishing=true', () => {
    render(<ProjectPreview {...DEFAULT_PROPS} isPublishing={true} />)
    const btn = screen.getByRole('button', { name: /publicando/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('Publicando...')
  })

  it('llama a onPublish al hacer click en Publicar (cuando no está publicando)', () => {
    const onPublish = vi.fn()
    render(<ProjectPreview {...DEFAULT_PROPS} onPublish={onPublish} isPublishing={false} />)
    fireEvent.click(screen.getByRole('button', { name: /publicar/i }))
    expect(onPublish).toHaveBeenCalledOnce()
  })
})
