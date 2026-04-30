// @vitest-environment jsdom
// Story 10.2 — T1.7: Test unitario TDD para ProjectTemplateSelector

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { ProjectTemplateSelector } from '@/components/projects/ProjectTemplateSelector'
import type { ProjectTemplate } from '@/lib/types/templates'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeTemplate = (overrides: Partial<ProjectTemplate> = {}): ProjectTemplate => ({
  id: 'test-id',
  type: 'saas',
  name: 'SaaS',
  descriptionStructure: {
    problem: { placeholder: 'SaaS problem placeholder', example: 'SaaS problem example' },
    solution: { placeholder: 'SaaS solution placeholder', example: 'SaaS solution example' },
  },
  reviewerContext: 'SaaS reviewer context',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

export const TEMPLATE_SAAS: ProjectTemplate = makeTemplate({
  id: '11111111-0000-0000-0000-000000000001',
  type: 'saas',
  name: 'SaaS',
  reviewerContext: 'Saas: valora tamaño de mercado y diferenciación.',
})
export const TEMPLATE_FEATURE: ProjectTemplate = makeTemplate({
  id: '11111111-0000-0000-0000-000000000002',
  type: 'feature',
  name: 'Feature / Mejora',
  reviewerContext: 'Feature: valora impacto en UX y viabilidad técnica.',
  descriptionStructure: {
    problem: { placeholder: 'Feature problem placeholder', example: 'Feature problem example' },
    solution: { placeholder: 'Feature solution placeholder', example: 'Feature solution example' },
  },
})
export const TEMPLATE_INTERNAL: ProjectTemplate = makeTemplate({
  id: '11111111-0000-0000-0000-000000000003',
  type: 'internal_process',
  name: 'Proceso Interno',
  reviewerContext: 'Proceso Interno: valora ahorro de tiempo y ROI interno.',
  descriptionStructure: {
    problem: { placeholder: 'Internal problem placeholder', example: 'Internal problem example' },
    solution: { placeholder: 'Internal solution placeholder', example: 'Internal solution example' },
  },
})
export const TEMPLATE_PHYSICAL: ProjectTemplate = makeTemplate({
  id: '11111111-0000-0000-0000-000000000004',
  type: 'physical_product',
  name: 'Producto Físico',
  reviewerContext: 'Producto Físico: valora usabilidad y coste de fabricación.',
  descriptionStructure: {
    problem: { placeholder: 'Physical problem placeholder', example: 'Physical problem example' },
    solution: { placeholder: 'Physical solution placeholder', example: 'Physical solution example' },
  },
})
export const TEMPLATE_SERVICE: ProjectTemplate = makeTemplate({
  id: '11111111-0000-0000-0000-000000000005',
  type: 'service',
  name: 'Servicio',
  reviewerContext: 'Servicio: valora propuesta de valor y escalabilidad.',
  descriptionStructure: {
    problem: { placeholder: 'Service problem placeholder', example: 'Service problem example' },
    solution: { placeholder: 'Service solution placeholder', example: 'Service solution example' },
  },
})

const ALL_TEMPLATES: ProjectTemplate[] = [
  TEMPLATE_SAAS,
  TEMPLATE_FEATURE,
  TEMPLATE_INTERNAL,
  TEMPLATE_PHYSICAL,
  TEMPLATE_SERVICE,
]

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ProjectTemplateSelector', () => {
  describe('render con 5 templates', () => {
    it('renderiza 5 cards de template', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      expect(screen.getByText('SaaS')).toBeInTheDocument()
      expect(screen.getByText('Feature / Mejora')).toBeInTheDocument()
      expect(screen.getByText('Proceso Interno')).toBeInTheDocument()
      expect(screen.getByText('Producto Físico')).toBeInTheDocument()
      expect(screen.getByText('Servicio')).toBeInTheDocument()
    })

    it('renderiza el botón de skip (sin tipo)', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      expect(screen.getByRole('button', { name: /sin tipo/i })).toBeInTheDocument()
    })

    it('no marca ningún template como seleccionado cuando selectedId es null', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      // Los botones de template (excluido el skip) no están seleccionados
      const templateButtons = ALL_TEMPLATES.map((t) =>
        screen.getByRole('button', { name: new RegExp(t.name, 'i') }),
      )
      templateButtons.forEach((card) => {
        expect(card).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('selección de template', () => {
    it('llama a onSelect con el id del template al hacer click', () => {
      const onSelect = vi.fn()
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={onSelect}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      expect(onSelect).toHaveBeenCalledWith(TEMPLATE_SAAS.id)
    })

    it('marca la card como seleccionada cuando selectedId coincide', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={TEMPLATE_SAAS.id}
          onSelect={vi.fn()}
        />,
      )

      const saasButton = screen.getByRole('button', { name: /saas/i })
      expect(saasButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('solo una card está seleccionada a la vez', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={TEMPLATE_FEATURE.id}
          onSelect={vi.fn()}
        />,
      )

      const pressedButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('aria-pressed') === 'true')

      expect(pressedButtons).toHaveLength(1)
      expect(pressedButtons[0]).toHaveAccessibleName(/feature/i)
    })
  })

  describe('opción skip', () => {
    it('llama a onSelect(null) al hacer click en Sin tipo', () => {
      const onSelect = vi.fn()
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={TEMPLATE_SAAS.id}
          onSelect={onSelect}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: /sin tipo/i }))

      expect(onSelect).toHaveBeenCalledWith(null)
    })

    it('marca el botón Sin tipo como seleccionado cuando selectedId es null', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      const skipButton = screen.getByRole('button', { name: /sin tipo/i })
      expect(skipButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('lista vacía', () => {
    it('no renderiza cards de template cuando la lista está vacía', () => {
      render(
        <ProjectTemplateSelector
          templates={[]}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      // Solo debe aparecer el botón de skip
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveAccessibleName(/sin tipo/i)
    })
  })

  describe('HIGH-1 CR fix — descripción corta (reviewerContext)', () => {
    it('muestra el reviewerContext como descripción corta en cada card', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      // TEMPLATE_SAAS tiene reviewerContext definido
      expect(screen.getByText(TEMPLATE_SAAS.reviewerContext)).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_FEATURE.reviewerContext)).toBeInTheDocument()
    })

    it('no renderiza descripción si reviewerContext es cadena vacía', () => {
      const templateSinContext = makeTemplate({
        id: 'sin-context-id',
        reviewerContext: '',
      })
      render(
        <ProjectTemplateSelector
          templates={[templateSinContext]}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      // El nombre sí debe aparecer, pero no descripción vacía adicional
      expect(screen.getByText('SaaS')).toBeInTheDocument()
    })
  })

  describe('HIGH-2 CR fix — grid responsive', () => {
    it('el grid tiene className="template-grid" para responsive CSS', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      const grid = screen.getByTestId('template-grid')
      expect(grid).toHaveClass('template-grid')
    })
  })

  describe('MEDIUM-3 CR fix — sin role="button" redundante', () => {
    it('los botones de template no tienen role="button" explícito', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      // role="button" en un <button> nativo es redundante — verificamos que no se asigna explícitamente
      // (el role implícito de <button> sigue siendo button)
      const templateButton = screen.getByRole('button', { name: /saas/i })
      expect(templateButton.tagName.toLowerCase()).toBe('button')
      // El role implícito es button — el atributo role no debe estar en el DOM si no se asignó explícitamente
      expect(templateButton).not.toHaveAttribute('role', 'button')
    })

    it('el botón Sin tipo no tiene role="button" explícito', () => {
      render(
        <ProjectTemplateSelector
          templates={ALL_TEMPLATES}
          selectedId={null}
          onSelect={vi.fn()}
        />,
      )

      const skipButton = screen.getByRole('button', { name: /sin tipo/i })
      expect(skipButton.tagName.toLowerCase()).toBe('button')
      expect(skipButton).not.toHaveAttribute('role', 'button')
    })
  })
})
