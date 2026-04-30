import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, spyOn } from 'storybook/test'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { ProjectRow } from '@/lib/types/projects'

const meta = {
  title: 'Projects/ProjectForm',
  component: ProjectForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ProjectForm>

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ───────────────────────────────────────────────────────────────────

const COMMUNITY_ID = 'b0000000-0000-4000-8000-000000000001'
const COMMUNITY_SLUG = 'producto-alpha'
const PROJECT_ID = 'c0000000-0000-4000-8000-000000000099'

const defaultProject: ProjectRow = {
  id: PROJECT_ID,
  slug: 'mi-proyecto-editable',
  community_id: COMMUNITY_ID,
  builder_id: 'a0000000-0000-4000-8000-000000000001',
  title: 'Mi proyecto editable',
  problem: 'Los equipos remotos pierden el rastro de la moral del equipo.',
  solution: 'Una encuesta semanal de pulso de 3 preguntas que tarda menos de 60 segundos.',
  hypothesis: 'Si reducimos la fricción al mínimo, la tasa de respuesta semanal superará el 80%.',
  image_urls: [],
  status: 'draft',
  decision: null,
  decided_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  target_user: 'Engineering managers en equipos de 10-50 personas',
  demo_url: 'https://demo.miproyecto.com',
  feedback_topics: ['Claridad del problema', 'UX del onboarding'],
  tagline: 'Pulso semanal en 60 segundos',
  would_use_count: 0,
  template_id: null,
}

// ── Stories ────────────────────────────────────────────────────────────────────

export const ModoCrear: Story = {
  args: {
    communityId: COMMUNITY_ID,
    communitySlug: COMMUNITY_SLUG,
  },
}

export const ModoEditar: Story = {
  args: {
    communityId: COMMUNITY_ID,
    communitySlug: COMMUNITY_SLUG,
    projectId: PROJECT_ID,
    defaultValues: defaultProject,
  },
}

/**
 * ErrorValidacion — submit con campos vacíos → errores de validación visibles.
 * La play function hace click en "Crear proyecto" sin rellenar nada.
 */
export const ErrorValidacion: Story = {
  args: {
    communityId: COMMUNITY_ID,
    communitySlug: COMMUNITY_SLUG,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    // Limpiar el título si tiene valor por defecto y hacer submit
    const submitButton = canvas.getByRole('button', { name: 'Crear proyecto' })
    await user.click(submitButton)

    // El formulario debe mostrar errores de validación bajo los campos requeridos
    const alert = await canvas.findByRole('alert')
    await expect(alert).toBeInTheDocument()
  },
}

/**
 * ErrorServidor — mock fetch → 500 → no hay mensaje de error global visible
 * (ProjectForm captura el error en consola pero no lo muestra en UI actualmente).
 * La play function rellena campos válidos y hace submit contra un fetch mockeado.
 */
export const ErrorServidor: Story = {
  args: {
    communityId: COMMUNITY_ID,
    communitySlug: COMMUNITY_SLUG,
  },
  parameters: {
    mockData: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    // Mock global fetch para devolver 500
    const fetchSpy = spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    try {
      await user.type(canvas.getByLabelText(/título/i), 'Proyecto de prueba')
      await user.type(
        canvas.getByLabelText(/descripción del problema/i),
        'Un problema real que afecta a muchos usuarios.'
      )
      await user.type(canvas.getByLabelText(/solución propuesta/i), 'Una solución efectiva y simple.')
      await user.type(canvas.getByLabelText(/hipótesis/i), 'Si lanzamos esto, el 80% lo usará.')

      const submitButton = canvas.getByRole('button', { name: 'Crear proyecto' })
      await user.click(submitButton)
    } finally {
      // Restaurar fetch original siempre, incluso si la interacción falla
      fetchSpy.mockRestore()
    }
  },
}
