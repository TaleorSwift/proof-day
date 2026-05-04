// @vitest-environment jsdom
/**
 * Tests de integración — LaunchIdeaModal + ProjectTemplateSelector (Story 10.2)
 * Actualizado en Story 10.3: el modal ahora usa ProjectWizard — el selector
 * de template es el paso 1 del wizard.
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

// Navega al paso 2 y rellena los campos requeridos (wizard)
function navigateToStep2AndFill() {
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
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

describe('LaunchIdeaModal con ProjectTemplateSelector — Story 10.2 (wizard)', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockReset()
    mockTemplatesFetch()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('T2.2/T2.3: fetch y render del selector al montar (paso 1 del wizard)', () => {
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

    it('el wizard sigue navegable junto al selector', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      // El botón Continuar del paso 1 está disponible
      expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
    })
  })

  describe('T2.4: placeholders dinámicos según template seleccionado (paso 2 del wizard)', () => {
    it('el textarea de problema usa el placeholder del template seleccionado', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByText('SaaS')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /saas/i }))
      // Avanzar a paso 2
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

      const problemTextarea = screen.getByTestId('wizard-field-problem')
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
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

      const solutionTextarea = screen.getByTestId('wizard-field-solution')
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

      // Seleccionar SaaS, luego deseleccionar
      fireEvent.click(screen.getByRole('button', { name: /saas/i }))
      fireEvent.click(screen.getByRole('button', { name: /sin tipo/i }))

      // Avanzar a paso 2
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

      const problemTextarea = screen.getByTestId('wizard-field-problem')
      expect(problemTextarea).toHaveAttribute('placeholder', '¿Qué problema resuelves?')
    })
  })

  // Story 10.4: submit migrado al paso 5 (ProjectPreview → botón "Publicar")
  describe('T2.5: submit incluye templateId', () => {
    function navigateToStep5AndPublish() {
      // navigateToStep2AndFill ya está en el paso 2 con datos
      // avanzar 2 → 3 → 4 → 5
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
      fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
      fireEvent.click(screen.getByRole('button', { name: /publicar/i }))
    }

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

      // Seleccionar SaaS en paso 1
      fireEvent.click(screen.getByRole('button', { name: /saas/i }))

      // Navegar a paso 2, rellenar, avanzar hasta paso 5 y publicar
      navigateToStep2AndFill()
      navigateToStep5AndPublish()

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

      // No seleccionamos template — avanzar hasta paso 5 y publicar
      navigateToStep2AndFill()
      navigateToStep5AndPublish()

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
    it('sigue mostrando el wizard cuando el fetch falla', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      // El wizard debe estar disponible incluso si el fetch falla
      expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      // El wizard sigue siendo accesible
      expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
    })
  })

  describe('MEDIUM-5 CR fix — estado vacío cuando fetch devuelve 0 templates', () => {
    it('muestra mensaje "No hay tipos disponibles" cuando el fetch devuelve lista vacía', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response)

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByTestId('templates-empty-state')).toBeInTheDocument()
      })

      expect(screen.getByText(/no hay tipos disponibles/i)).toBeInTheDocument()
    })

    it('el wizard sigue accesible cuando no hay templates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response)

      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      await waitFor(() => {
        expect(screen.getByTestId('templates-empty-state')).toBeInTheDocument()
      })

      // El botón Continuar del paso 1 sigue disponible
      expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument()
    })
  })

  describe('MEDIUM-6 CR fix — DialogDescription para accesibilidad', () => {
    it('el modal tiene DialogDescription para aria-describedby', async () => {
      render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

      expect(
        screen.getByText('Formulario para lanzar una nueva idea de proyecto'),
      ).toBeInTheDocument()
    })
  })
})
