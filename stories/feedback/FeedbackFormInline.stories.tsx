import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackFormInline } from '@/components/feedback/FeedbackFormInline'

const meta = {
  title: 'Feedback/FeedbackFormInline',
  component: FeedbackFormInline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackFormInline>

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

// Story 10.5 — HypothesisContextBanner
export const ConHipotesis: Story = {
  name: 'Con hipótesis del proyecto',
  args: {
    projectId: 'proj-storybook-001',
    communityId: 'comm-storybook-001',
    hypothesis: 'Si reducimos el tiempo de onboarding a menos de 5 minutos, entonces la tasa de activación sube un 30%.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 10.5 — Muestra el banner de hipótesis en modo read-only antes del formulario cuando el proyecto tiene hypothesis definida.',
      },
    },
  },
}
