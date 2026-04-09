import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from '@/components/projects/StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  title: 'projects/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['live', 'draft', 'inactive'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Live: Story = {
  name: 'Live',
  args: {
    status: 'live',
  },
}

export const Draft: Story = {
  name: 'Borrador',
  args: {
    status: 'draft',
  },
}

export const Closed: Story = {
  name: 'Cerrado',
  args: {
    status: 'inactive',
  },
}
