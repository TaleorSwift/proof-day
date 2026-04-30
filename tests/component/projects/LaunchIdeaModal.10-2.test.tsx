// @vitest-environment jsdom
/**
 * Tests de integración — LaunchIdeaModal + ProjectTemplateSelector (Story 10.2)
 * T2.6: modal con selector renderizado, selección de template, submit con templateId
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ALL_TEMPLATES, TEMPLATE_SAAS } from '@/lib/fixtures/templates'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/actions/projects/launchProject', () => ({
  launchProject: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
  Toaster: () => null,
}))

// Mock del fetch global para la llamada a /api/templates
const originalFetch = global.fetch

// ── Imports post-mock ─────────────────────────────────────────────────────────

import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'
import { launchProject } from '@/actions/projects/launchProject'

const DEFAULT_PROPS = {
  open: true,
  onOpenChange: vi.fn(),
  communitySlug: 'startup-madrid',
}

function mockTemplatesFetch(templates = ALL_TEMPLATES) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: templates }),
  } as Response)
}

function fillRequiredFields() {
  fireEvent.change(screen.getByTestId('modal-field-title'), {
    target: { value: 'Pulse Check' },
  })
  fireEvent.change(screen.getByTestId('modal-field-tagline'), {
    target: { value: 'Valida tu idea en horas' },
  })
  fireEvent.change(screen.getByTestId('modal-field-problem'), {
    target: { value: 'Los builders no saben qué construir primero' },
  })
  fireEvent.change(screen.getByTestId('modal-field-solution'), {
    target: { value: 'Un modal rápido para lanzar ideas' },
  })
  fireEvent.change(screen.getByTestId('modal-field-hypothesis'), {
    target: { value: 'Si lanzo rápido, entonces recibo feedback antes' },
  })
}

describe('LaunchIdeaModal con ProjectTemplateSelector — Story 10.2', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockReset()
    mockTemplatesFetch()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('T2.2/T2.3: fetch y render del selector al montar', () => {
    it('renderiza el ProjectTemplateSelector con los 5 templates tras el fetch', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      expect(screen.getByText('Feature / Mejora')).toBeInTheDocument()
      expect(screen.getByText('Proceso Interno')).toBeInTheDocument()
      expect(screen.getByText('Producto Físico')).toBeInTheDocument()
      expect(screen.getByText('Servicio')).toBeInTheDocument()
    })

    it('llama a GET /api/templates al montar', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/templates')
      })
    })

    it('el formulario principal sigue visible junto al selector', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      // El formulario sigue accesible
      expect(screen.getByTestId('modal-field-title')).toBeInTheDocument()
      expect(screen.getByTestId('modal-field-problem')).toBeInTheDocument()
    })
  })

  describe('T2.4: placeholders dinámicos según template seleccionado', () => {
    it('el textarea de problema usa el placeholder del template seleccionado', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      const problemTextarea = screen.getByTestId('modal-field-problem')
      expect(problemTextarea).toHaveAttribute(
        'placeholder',
        TEMPLATE_SAAS.descriptionStructure.problem.placeholder,
      )
    })

    it('el textarea de solución usa el placeholder del template seleccionado', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      const solutionTextarea = screen.getByTestId('modal-field-solution')
      expect(solutionTextarea).toHaveAttribute(
        'placeholder',
        TEMPLATE_SAAS.descriptionStructure.solution.placeholder,
      )
    })

    it('los placeholders vuelven al valor por defecto al seleccionar "Sin tipo"', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      // Seleccionar SaaS primero
      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      // Luego seleccionar "Sin tipo"
      fireEvent.click(screen.getByRole('button', { name: /sin tipo/i }))

      const problemTextarea = screen.getByTestId('modal-field-problem')
      expect(problemTextarea).toHaveAttribute('placeholder', '¿Qué problema resuelves?')
    })
  })

  describe('T2.5: submit incluye templateId', () => {
    it('submit incluye templateId cuando hay un template seleccionado', async () => {
      vi.mocked(launchProject).mockResolvedValue({
        success: true,
        projectId: 'proj-1',
        projectSlug: 'pulse-check',
      })

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      // Seleccionar SaaS
      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      // Rellenar campos requeridos
      fillRequiredFields()

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /lanzar proyecto/i }))

      await waitFor(() => {
        expect(launchProject).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: TEMPLATE_SAAS.id,
          }),
        )
      })
    })

    it('submit incluye templateId=null cuando no se selecciona template (AC-4)', async () => {
      vi.mocked(launchProject).mockResolvedValue({
        success: true,
        projectId: 'proj-2',
        projectSlug: 'pulse-check',
      })

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      // No seleccionamos template — Sin tipo por defecto
      fillRequiredFields()

      fireEvent.click(screen.getByRole('button', { name: /lanzar proyecto/i }))

      await waitFor(() => {
        expect(launchProject).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: null,
          }),
        )
      })
    })
  })

  describe('fallback sin templates', () => {
    it('sigue mostrando el formulario cuando el fetch falla', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      // El formulario debe estar disponible incluso si el fetch falla
      expect(screen.getByTestId('modal-field-title')).toBeInTheDocument()

      // Esperar a que el fetch se intente y falle
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      // El formulario sigue siendo accesible
      expect(screen.getByTestId('modal-field-title')).toBeInTheDocument()
    })
  })
})
