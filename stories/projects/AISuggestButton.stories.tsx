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
  decorators: [
    (Story) => {
      // Inyectamos un mock de fetch que nunca resuelve para simular el estado loading.
      // El decorator restaura el original al desmontar, sin contaminar el entorno global.
      const originalFetch = window.fetch
      const neverResolvesFetch = () => new Promise<Response>(() => {})
      window.fetch = neverResolvesFetch
      return (
        <div
          ref={() => {
            return () => {
              window.fetch = originalFetch
            }
          }}
        >
          <Story />
        </div>
      )
    },
  ],
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
