import type { Meta, StoryObj } from '@storybook/react'
import { TeamPerspectives } from '@/components/feedback/TeamPerspectives'

const meta: Meta<typeof TeamPerspectives> = {
  title: 'feedback/TeamPerspectives',
  component: TeamPerspectives,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const ConFeedbacks: Story = {
  name: 'Con feedbacks — variedad de badges y textos',
  args: {
    feedbacks: [
      {
        id: 'f-1',
        reviewerName: 'Carlos López',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
        textResponses: {
          p1: 'Sí, el problema es muy real en equipos distribuidos.',
          p2: 'Definitivamente la usaría.',
          p3: 'Es viable técnicamente con el stack actual.',
          p4: 'Añadiría integración con Slack para notificaciones en tiempo real.',
        },
        contributorType: 'top-reviewer',
      },
      {
        id: 'f-2',
        reviewerName: 'Ana García',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // hace 1 día
        textResponses: {
          p4: 'Mejoraría el onboarding y añadiría un modo offline.',
        },
        contributorType: 'insightful',
      },
      {
        id: 'f-3',
        reviewerName: 'Juan Martínez',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // hace 3 días
        textResponses: {
          p2: 'Puede que la usara si el precio es competitivo.',
          p4: 'El modelo de negocio necesita más definición.',
        },
      },
    ],
  },
}

export const SinBadges: Story = {
  name: 'Con feedbacks — sin badges de contribuidor',
  args: {
    feedbacks: [
      {
        id: 'f-4',
        reviewerName: 'Laura Sánchez',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // hace 45 minutos
        textResponses: {
          p4: 'El mercado objetivo está bien definido.',
        },
      },
      {
        id: 'f-5',
        reviewerName: 'Pedro Ruiz',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // hace 5 horas
        textResponses: {
          p1: 'El problema existe pero la solución propuesta no es única.',
          p4: 'Diferenciarse más del competidor principal sería clave.',
        },
      },
      {
        id: 'f-6',
        reviewerName: 'Elena Gómez',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // hace 2 días
        textResponses: {
          p4: 'Añadiría más casos de uso reales en la presentación.',
        },
      },
    ],
  },
}

export const Vacio: Story = {
  name: 'Lista vacía — empty state',
  args: {
    feedbacks: [],
  },
}
