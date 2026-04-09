import type { Meta, StoryObj } from '@storybook/react'
import { HeartButton } from '@/components/ui/HeartButton'

const meta: Meta<typeof HeartButton> = {
  title: 'shared/HeartButton',
  component: HeartButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: 'number',
    },
    isActive: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  name: 'Inactivo',
  args: {
    count: 12,
    isActive: false,
  },
}

export const Active: Story = {
  name: 'Activo',
  args: {
    count: 13,
    isActive: true,
  },
}

export const WithZeroCount: Story = {
  name: 'Sin likes',
  args: {
    count: 0,
    isActive: false,
  },
}

export const WithHighCount: Story = {
  name: 'Muchos likes',
  args: {
    count: 248,
    isActive: true,
  },
}

export const Disabled: Story = {
  name: 'Deshabilitado',
  args: {
    count: 5,
    isActive: false,
    disabled: true,
  },
}
