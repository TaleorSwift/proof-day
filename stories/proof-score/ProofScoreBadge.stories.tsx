import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProofScoreBadge } from '@/components/proof-score/ProofScoreBadge'

const meta = {
  title: 'ProofScore/ProofScoreBadge',
  component: ProofScoreBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProofScoreBadge>

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
