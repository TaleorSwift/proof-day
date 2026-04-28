// CommunityForm es un Client Component con RHF + zod.
// Los estados de error post-submit se muestran con play functions que mockean window.fetch.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent } from 'storybook/test'
import { CommunityForm } from '@/components/communities/CommunityForm'

const meta = {
  title: 'Communities/CommunityForm',
  component: CommunityForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof CommunityForm>

export default meta
type Story = StoryObj<typeof meta>

// Estado inicial — formulario vacío, listo para recibir input.
export const Default: Story = {
  args: {},
}

// Estado error inline — nombre ya tomado.
// Muestra error bajo el campo "Nombre" tras intentar crear una comunidad duplicada.
export const ErrorNombreTomado: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch
    window.fetch = async () =>
      new Response(
        JSON.stringify({ error: 'El nombre ya está en uso', code: 'COMMUNITY_NAME_TAKEN' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      )

    const user = userEvent.setup()
    await user.type(canvas.getByLabelText(/Nombre/i), 'Comunidad Existente')
    await user.type(canvas.getByLabelText(/Descripción/i), 'Una descripción válida con suficientes chars')
    await user.click(canvas.getByRole('button', { name: /Crear comunidad/i }))

    window.fetch = originalFetch
  },
}

// Estado error global — error de servidor genérico.
// Muestra el mensaje de error en el párrafo global con role="alert" (no inline).
export const ErrorServidor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch
    window.fetch = async () =>
      new Response(
        JSON.stringify({ error: 'Error interno del servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )

    const user = userEvent.setup()
    await user.type(canvas.getByLabelText(/Nombre/i), 'Mi Comunidad')
    await user.type(canvas.getByLabelText(/Descripción/i), 'Una descripción válida con suficientes chars')
    await user.click(canvas.getByRole('button', { name: /Crear comunidad/i }))

    window.fetch = originalFetch
  },
}
