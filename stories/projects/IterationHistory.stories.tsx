// Story 13.6 — Storybook para IterationHistory
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IterationHistory } from '@/components/projects/IterationHistory'

const meta = {
  title: 'Projects/IterationHistory',
  component: IterationHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof IterationHistory>

export default meta
type Story = StoryObj<typeof meta>

export const UnaIteracion: Story = {
  args: {
    iterations: [
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
    ],
  },
}

export const VariasIteraciones: Story = {
  args: {
    iterations: [
      { id: 'iter-3', versionNumber: 3, publishedAt: '2026-05-01T10:00:00Z', feedbackCount: 3 },
      { id: 'iter-2', versionNumber: 2, publishedAt: '2026-04-10T10:00:00Z', feedbackCount: 12 },
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
    ],
  },
}

export const SinFeedbacksEnUltima: Story = {
  args: {
    iterations: [
      { id: 'iter-2', versionNumber: 2, publishedAt: '2026-05-07T10:00:00Z', feedbackCount: 0 },
      { id: 'iter-1', versionNumber: 1, publishedAt: '2026-03-15T10:00:00Z', feedbackCount: 8 },
    ],
  },
}
