import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Continuar',
    variant: 'default',
  },
}

export const CTA: Story = {
  args: {
    children: 'Publicar proyecto',
    variant: 'default',
    size: 'lg',
  },
}

export const Outline: Story = {
  args: {
    children: 'Cancelar',
    variant: 'outline',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Abandonar proyecto',
    variant: 'destructive',
  },
}
