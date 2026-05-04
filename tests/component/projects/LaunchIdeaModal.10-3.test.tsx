// @vitest-environment jsdom
/**
 * Tests de regresión — LaunchIdeaModal con ProjectWizard (Story 10.3)
 * Story 10.4: submit migrado del paso 3 ("Lanzar proyecto") al paso 5 ("Publicar")
 * T5.5: comportamiento del modal antes de esta story sigue funcionando
 *        (submit, error handling, reset)
 * AC-1: ejemplos contextuales en paso 2 cuando hay template seleccionado
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
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

const originalFetch = global.fetch

import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'
import { launchProject } from '@/actions/projects/launchProject'
import { toast } from 'sonner'

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

// Navega al paso 2 del wizard y rellena los campos requeridos
async function navigateToStep2AndFill() {
  // Paso 1 → Paso 2
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

// Navega hasta el paso 5 (preview) y hace click en Publicar
// Story 10.4: submit ocurre ahora desde el paso 5
async function navigateToPreviewAndPublish() {
  await navigateToStep2AndFill()

  // Paso 2 → Paso 3
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Paso 3 → Paso 4
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Paso 4 → Paso 5
  fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

  // Submit desde paso 5
  fireEvent.click(screen.getByRole('button', { name: /publicar/i }))
}

// ── T5.3: submit, toast, onSuccess, reset ────────────────────────────────────

describe('LaunchIdeaModal con wizard — T5.3: submit exitoso (Story 10.4: desde paso 5)', () => {
  beforeEach(() => {
    vi.mocked(launchProject).mockReset()
    mockTemplatesFetch()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('llama a launchProject con los datos del wizard al publicar desde paso 5', async () => {
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'new-id',
      projectSlug: 'pulse-check',
    })

    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

    await navigateToPreviewAndPublish()

    await waitFor(() => {
      expect(launchProject).toHaveBeenCalledWith(
        expect.objectContaining({
          communitySlug: 'startup-madrid',
          title: 'Pulse Check',
          tagline: 'Valida tu idea en horas',
          problem: 'Los builders no saben qué construir primero',
          solution: 'Un modal rápido para lanzar ideas',
        }),
      )
    })
  })

  it('muestra toast de éxito tras submit exitoso', async () => {
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'new-id',
      projectSlug: 'pulse-check',
    })

    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    await navigateToPreviewAndPublish()

    await waitFor(() => {
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        '¡Idea lanzada! Ya está recibiendo feedback.',
      )
    })
  })

  it('llama a onOpenChange(false) tras submit exitoso', async () => {
    const onOpenChange = vi.fn()
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'new-id',
      projectSlug: 'pulse-check',
    })

    render(<LaunchIdeaModal {...DEFAULT_PROPS} onOpenChange={onOpenChange} />)
    await navigateToPreviewAndPublish()

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('muestra error cuando launchProject retorna success=false', async () => {
    vi.mocked(launchProject).mockResolvedValue({
      success: false,
      error: 'Error de servidor',
    })

    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    await navigateToPreviewAndPublish()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

// ── AC-1: hints contextuales con template ────────────────────────────────────

describe('LaunchIdeaModal con wizard — AC-1: ejemplos contextuales', () => {
  beforeEach(() => {
    mockTemplatesFetch()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('muestra el hint de problema tras seleccionar template en paso 1 y avanzar a paso 2', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

    // Esperar a que se carguen los templates
    await waitFor(() => {
      expect(screen.getByText('SaaS')).toBeInTheDocument()
    })

    // Seleccionar SaaS
    fireEvent.click(screen.getByRole('button', { name: /saas/i }))

    // Avanzar a paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    // El hint de problema debe estar visible
    expect(
      screen.getByText(
        `Ejemplo: ${TEMPLATE_SAAS.descriptionStructure.problem.example}`,
      ),
    ).toBeInTheDocument()
  })

  it('muestra el hint de solución tras seleccionar template y avanzar a paso 2', async () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

    await waitFor(() => {
      expect(screen.getByText('SaaS')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /saas/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(
      screen.getByText(
        `Ejemplo: ${TEMPLATE_SAAS.descriptionStructure.solution.example}`,
      ),
    ).toBeInTheDocument()
  })

  it('submit incluye templateId cuando hay template seleccionado', async () => {
    vi.mocked(launchProject).mockResolvedValue({
      success: true,
      projectId: 'proj-id',
      projectSlug: 'pulse-check',
    })

    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

    await waitFor(() => {
      expect(screen.getByText('SaaS')).toBeInTheDocument()
    })

    // Seleccionar SaaS
    fireEvent.click(screen.getByRole('button', { name: /saas/i }))

    // Avanzar y rellenar hasta paso 5
    await navigateToPreviewAndPublish()

    await waitFor(() => {
      expect(launchProject).toHaveBeenCalledWith(
        expect.objectContaining({ templateId: TEMPLATE_SAAS.id }),
      )
    })
  })
})

// ── HIGH-1: reset al cerrar y reabrir el modal ───────────────────────────────

describe('LaunchIdeaModal con wizard — HIGH-1: reset al reabrir', () => {
  beforeEach(() => {
    mockTemplatesFetch([])
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('al reabrir el modal el wizard empieza en el paso 1', () => {
    const { rerender } = render(<LaunchIdeaModal {...DEFAULT_PROPS} />)

    // Navegar al paso 2
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))
    expect(screen.getByTestId('wizard-step-2')).toBeInTheDocument()

    // Cerrar el modal (open=false)
    rerender(<LaunchIdeaModal {...DEFAULT_PROPS} open={false} />)

    // Reabrir el modal (open=true)
    rerender(<LaunchIdeaModal {...DEFAULT_PROPS} open={true} />)

    // El wizard debe estar de nuevo en el paso 1
    expect(screen.getByTestId('wizard-step-1')).toBeInTheDocument()
    expect(screen.queryByTestId('wizard-step-2')).not.toBeInTheDocument()
  })
})

// ── Accesibilidad y estructura ────────────────────────────────────────────────

describe('LaunchIdeaModal con wizard — accesibilidad y estructura', () => {
  beforeEach(() => {
    mockTemplatesFetch([])
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('el modal muestra el título "Lanzar una nueva idea"', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(screen.getByText('Lanzar una nueva idea')).toBeInTheDocument()
  })

  it('el modal tiene DialogDescription para aria-describedby', () => {
    render(<LaunchIdeaModal {...DEFAULT_PROPS} />)
    expect(
      screen.getByText('Formulario para lanzar una nueva idea de proyecto'),
    ).toBeInTheDocument()
  })

  it('el botón "Cancelar" cierra el modal', () => {
    const onOpenChange = vi.fn()
    render(<LaunchIdeaModal {...DEFAULT_PROPS} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
