// Story 13.7 — Storybook stories para AISuggestButton
// AC6: 3 variantes obligatorias — Default, Loading, Disabled

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { AISuggestButton } from '@/components/projects/wizard/AISuggestButton'

const meta = {
  title: 'Projects/AISuggestButton',
  component: AISuggestButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AISuggestButton>

export default meta
type Story = StoryObj<typeof meta>

/** Botón activo — el Builder ha escrito el nombre del proyecto */
export const Default: Story = {
  args: {
    field: 'problem',
    context: {
      title: 'Pulse Check',
      problem: '',
      solution: '',
    },
    onSuggestion: fn(),
  },
}

/** Botón en estado de carga — llamada a la API en progreso */
export const Loading: Story = {
  args: {
    field: 'problem',
    context: {
      title: 'Pulse Check',
      problem: '',
      solution: '',
    },
    onSuggestion: fn(),
    disabled: false,
  },
  render: (args) => {
    // Simulamos el estado loading sobreescribiendo el fetch global para que nunca resuelva
    if (typeof window !== 'undefined') {
      window.fetch = () => new Promise(() => {})
    }
    return <AISuggestButton {...args} />
  },
}

/** Botón deshabilitado — el Builder no ha escrito el nombre del proyecto todavía */
export const Disabled: Story = {
  args: {
    field: 'problem',
    context: {
      title: '',
      problem: '',
      solution: '',
    },
    onSuggestion: fn(),
  },
}
