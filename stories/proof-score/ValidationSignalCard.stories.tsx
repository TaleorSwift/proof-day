import type { Meta, StoryObj } from '@storybook/react'
import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'

const meta: Meta<typeof ValidationSignalCard> = {
  title: 'proof-score/ValidationSignalCard',
  component: ValidationSignalCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Promising: Story = {
  name: 'Promising',
  args: {
    score: {
      label: 'Promising',
      average: 78,
      feedbackCount: 12,
    },
  },
}

export const NeedsIteration: Story = {
  name: 'Needs Iteration',
  args: {
    score: {
      label: 'Needs iteration',
      average: 45,
      feedbackCount: 7,
    },
  },
}

export const Weak: Story = {
  name: 'Weak',
  args: {
    score: {
      label: 'Weak',
      average: 22,
      feedbackCount: 3,
    },
  },
}
