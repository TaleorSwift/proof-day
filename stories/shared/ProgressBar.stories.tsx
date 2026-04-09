import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from '@/components/ui/ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'shared/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    percentage: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: 'Vacío (0%)',
  args: {
    label: 'Validaciones completadas',
    percentage: 0,
  },
}

export const Half: Story = {
  name: 'Mitad (50%)',
  args: {
    label: 'Validaciones completadas',
    percentage: 50,
  },
}

export const Full: Story = {
  name: 'Completo (100%)',
  args: {
    label: 'Validaciones completadas',
    percentage: 100,
  },
}

export const Promising: Story = {
  name: 'Color verde (prometedor)',
  args: {
    label: 'Señal positiva',
    percentage: 75,
    color: 'var(--color-promising-text)',
  },
}

export const NeedsWork: Story = {
  name: 'Color ámbar (necesita trabajo)',
  args: {
    label: 'Señal media',
    percentage: 40,
    color: 'var(--color-needs-text)',
  },
}

export const Weak: Story = {
  name: 'Color rojo (débil)',
  args: {
    label: 'Señal débil',
    percentage: 20,
    color: 'var(--color-weak-text)',
  },
}
