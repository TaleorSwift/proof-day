import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'

const meta = {
  title: 'ProofScore/ValidationSignalCard',
  component: ValidationSignalCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ValidationSignalCard>

export default meta
type Story = StoryObj<typeof meta>

export const Promising: Story = {
  name: 'Promising',
  args: {
    understandPercent: 78,
    wouldUsePercent: 65,
    feedbackCount: 12,
  },
}

export const NeedsIteration: Story = {
  name: 'Needs Iteration',
  args: {
    understandPercent: 52,
    wouldUsePercent: 40,
    feedbackCount: 7,
  },
}

export const Weak: Story = {
  name: 'Weak',
  args: {
    understandPercent: 25,
    wouldUsePercent: 15,
    feedbackCount: 3,
  },
}

export const SinDatos: Story = {
  name: 'Sin Datos',
  args: {
    understandPercent: 0,
    wouldUsePercent: 0,
    feedbackCount: 0,
  },
}
