// ProfileForm es un Client Component con RHF + zod que llama a window.fetch vía updateProfile.
// Los estados de error post-submit se muestran con play functions que mockean window.fetch.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, spyOn } from 'storybook/test'
import { ProfileForm } from '@/components/profiles/ProfileForm'
import { fn } from 'storybook/test'
import { profileAlex, profileNewUser } from '@/lib/fixtures/profiles'

const meta = {
  title: 'Profiles/ProfileForm',
  component: ProfileForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/profile' },
    },
  },
  args: {
    onSuccess: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ProfileForm>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ────────────────────────────────────────────────────────────────────

/** Formulario con campos vacíos — usuario sin nombre ni bio. */
export const Vacio: Story = {
  args: {
    profile: profileNewUser,
  },
}

/** Formulario pre-rellenado con datos de un perfil existente. */
export const PreRellenado: Story = {
  args: {
    profile: profileAlex,
  },
}

/**
 * Enviando — simula el estado de carga mientras el fetch está en vuelo.
 * La play function rellena los campos y hace submit contra un fetch que tarda indefinidamente.
 */
export const Enviando: Story = {
  args: {
    profile: profileAlex,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    // Fetch que nunca resuelve → botón queda en "Guardando..."
    spyOn(window, 'fetch').mockReturnValue(new Promise(() => {}))

    await user.click(canvas.getByRole('button', { name: /Guardar/i }))
  },
}

/**
 * ErrorServidor — mock fetch → 500 → muestra mensaje de error global con role="alert".
 */
export const ErrorServidor: Story = {
  args: {
    profile: profileAlex,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    const fetchSpy = spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    try {
      await user.click(canvas.getByRole('button', { name: /Guardar/i }))
    } finally {
      fetchSpy.mockRestore()
    }
  },
}
