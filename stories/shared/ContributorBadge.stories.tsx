import type { Meta, StoryObj } from '@storybook/react'
import { ContributorBadge } from '@/components/ui/ContributorBadge'

const meta: Meta<typeof ContributorBadge> = {
  title: 'shared/ContributorBadge',
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
}

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
