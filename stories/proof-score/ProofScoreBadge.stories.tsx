import type { Meta, StoryObj } from '@storybook/react'
import { ProofScoreBadge } from '@/components/proof-score/ProofScoreBadge'

const meta: Meta<typeof ProofScoreBadge> = {
  title: 'proof-score/ProofScoreBadge',
  component: ProofScoreBadge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Promising: Story = {
  name: 'Promising (full)',
  args: {
    label: 'Promising',
    variant: 'full',
  },
}

export const NeedsIteration: Story = {
  name: 'NeedsIteration (full)',
  args: {
    label: 'Needs iteration',
    variant: 'full',
  },
}

export const Weak: Story = {
  name: 'Weak (full)',
  args: {
    label: 'Weak',
    variant: 'full',
  },
}

export const Compact: Story = {
  name: 'Compact',
  args: {
    label: 'Promising',
    variant: 'compact',
  },
}
