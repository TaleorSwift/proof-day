import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DecisionBadge } from '@/components/projects/DecisionBadge'

const meta = {
  title: 'Projects/DecisionBadge',
  component: DecisionBadge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DecisionBadge>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Iterate — badge completo con icono, etiqueta y descripción.
 */
export const Iterate: Story = {
  args: {
    decision: 'iterate',
  },
}

/**
 * Scale — badge completo para la decisión de escalar.
 */
export const Scale: Story = {
  args: {
    decision: 'scale',
  },
}

/**
 * Abandon — badge completo para la decisión de abandonar.
 */
export const Abandon: Story = {
  args: {
    decision: 'abandon',
  },
}

/**
 * IterateCompact — versión compacta (pill) para uso en listas o tarjetas.
 */
export const IterateCompact: Story = {
  name: 'Iterate (compacto)',
  args: {
    decision: 'iterate',
    compact: true,
  },
}

/**
 * ScaleCompact — versión compacta para la decisión de escalar.
 */
export const ScaleCompact: Story = {
  name: 'Scale (compacto)',
  args: {
    decision: 'scale',
    compact: true,
  },
}

/**
 * AbandonCompact — versión compacta para la decisión de abandonar.
 */
export const AbandonCompact: Story = {
  name: 'Abandon (compacto)',
  args: {
    decision: 'abandon',
    compact: true,
  },
}
