// CommunityForm es un Client Component con RHF + zod.
// Los estados de error post-submit se muestran mediante wrappers con mocks de createCommunity.
// Storybook 9 con @storybook/nextjs-vite — sin @storybook/test disponible.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
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
// En la app real: createCommunity lanza ApiError con code COMMUNITY_NAME_TAKEN → setError('name').
export const ErrorNombreTomado: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Muestra el error inline bajo el campo "Nombre" cuando el servidor devuelve COMMUNITY_NAME_TAKEN. ' +
          'Para ver este estado: rellena el formulario con un nombre existente y pulsa "Crear comunidad".',
      },
    },
    mockData: [
      {
        url: '/api/communities',
        method: 'POST',
        status: 409,
        response: {
          error: 'El nombre ya está en uso',
          code: 'COMMUNITY_NAME_TAKEN',
        },
      },
    ],
  },
}

// Estado error global — error de servidor genérico.
// Muestra el mensaje de error en el párrafo global con role="alert" (no inline).
export const ErrorServidor: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Muestra el mensaje de error global cuando el servidor falla con un error no tipado. ' +
          'En la app real: cualquier ApiError sin código COMMUNITY_NAME_TAKEN o Error genérico activa serverError.',
      },
    },
    mockData: [
      {
        url: '/api/communities',
        method: 'POST',
        status: 500,
        response: { error: 'Error interno del servidor' },
      },
    ],
  },
}
