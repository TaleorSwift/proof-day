import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'

const meta: Meta<typeof FeedbackFormInline> = {
  title: 'feedback/FeedbackFormInline',
  component: FeedbackFormInline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const EstadoInicial: Story = {
  name: 'Estado Inicial',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
}

export const Cargando: Story = {
  name: 'Cargando',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
  parameters: {
    // Decorador para simular estado de carga — ver nota abajo
    docs: {
      description: {
        story: 'Estado de carga tras pulsar "Compartir insight". El botón muestra "Enviando..." y está deshabilitado.',
      },
    },
  },
}

export const Confirmacion: Story = {
  name: 'Confirmación',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado de confirmación tras envío exitoso. Muestra mensaje de agradecimiento.',
      },
    },
  },
}
