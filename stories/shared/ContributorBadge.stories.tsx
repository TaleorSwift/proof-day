import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContributorBadge } from '@/components/shared/ContributorBadge'

const meta = {
  title: 'Shared/ContributorBadge',
  component: ContributorBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['top-reviewer', 'insightful', 'changed-thinking'],
    },
  },
} satisfies Meta<typeof ContributorBadge>

export default meta
type Story = StoryObj<typeof meta>

export const TopReviewer: Story = {
  name: 'Top Reviewer',
  args: {
    type: 'top-reviewer',
  },
}

export const Insightful: Story = {
  name: 'Perspicaz',
  args: {
    type: 'insightful',
  },
}

export const ChangedThinking: Story = {
  name: 'Cambió perspectiva',
  args: {
    type: 'changed-thinking',
  },
}
