import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackList } from '@/components/feedback/FeedbackList'

const meta = {
  title: 'Feedback/FeedbackList',
  component: FeedbackList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FeedbackList>

export default meta
type Story = StoryObj<typeof meta>

// FeedbackList es 'use client' y hace fetch interno vía getFeedbacks.
// Sin mock de getFeedbacks, todas las stories muestran el estado de carga inicial.
// Para variantes con datos reales, mockear getFeedbacks en un decorator de story.

export const OwnerCargaInicial: Story = {
  name: 'Owner — Carga inicial (getFeedbacks sin mock)',
  parameters: {
    docs: {
      description: {
        story: 'Vista inicial mientras carga. Sin mock de getFeedbacks, el estado de datos no es reproducible automáticamente.',
      },
    },
  },
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
  },
}

export const NoBuilder: Story = {
  name: 'No Builder (oculto — devuelve null)',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: false,
  },
}
