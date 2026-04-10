import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackEntry } from '@/components/feedback/FeedbackEntry'

const meta: Meta<typeof FeedbackEntry> = {
  title: 'feedback/FeedbackEntry',
  component: FeedbackEntry,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const ConTextoCompleto: Story = {
  name: 'Con texto completo y badge top-reviewer',
  args: {
    data: {
      id: 'story-1',
      reviewerName: 'Carlos López',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // hace 3 horas
      textResponses: {
        p1: 'Sí, el problema que describes es muy real en equipos de producto.',
        p2: 'Definitivamente la usaría en mi trabajo diario.',
        p3: 'Es viable con las herramientas actuales del mercado.',
        p4: 'Añadiría integración con herramientas de gestión de proyectos como Jira o Notion.',
      },
      contributorType: 'top-reviewer',
    },
  },
}

export const SinBadge: Story = {
  name: 'Sin badge, solo p4',
  args: {
    data: {
      id: 'story-2',
      reviewerName: 'Ana García',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // hace 2 días
      textResponses: {
        p4: 'Mejoraría la experiencia de onboarding para que nuevos usuarios entiendan el valor más rápido.',
      },
    },
  },
}

export const SoloObligatorio: Story = {
  name: 'Solo campo obligatorio p4',
  args: {
    data: {
      id: 'story-3',
      reviewerName: 'María Torres',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 minutos
      textResponses: {
        p4: 'La propuesta de valor es clara y diferenciada.',
      },
      contributorType: 'insightful',
    },
  },
}
