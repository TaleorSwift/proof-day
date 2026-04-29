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
// En Storybook se renderiza en estado de carga inicial o vacío.
// Para variantes con datos, mockear getFeedbacks en el decorator si se necesita.

export const OwnerConFeedbacks: Story = {
  name: 'Owner — con feedbacks (estado inicial/carga)',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
  },
}

export const OwnerSinFeedbacks: Story = {
  name: 'Owner — sin feedbacks aún',
  args: {
    projectId: 'proj-storybook-002',
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
