// Story 10.3 — T7.4: Storybook story para ProjectWizard
// Story 11.2 — variante con customQuestion en paso 3

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { ProjectWizard } from '@/components/projects/ProjectWizard'
import { ALL_TEMPLATES } from '@/lib/fixtures/templates'

const meta = {
  title: 'Projects/ProjectWizard',
  component: ProjectWizard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectWizard>

export default meta
type Story = StoryObj<typeof meta>

/** Estado inicial: paso 1 — selector de tipo (sin templates cargados aún) */
export const EstadoInicial: Story = {
  args: {
    templates: [],
    onSubmit: fn(),
    onCancel: fn(),
  },
}

/** Paso 1 con templates cargados */
export const Paso1ConTemplates: Story = {
  args: {
    templates: ALL_TEMPLATES,
    onSubmit: fn(),
    onCancel: fn(),
  },
}

/** Estado de error de servidor en paso 3 */
export const ConErrorDeServidor: Story = {
  args: {
    templates: ALL_TEMPLATES,
    onSubmit: fn(),
    onCancel: fn(),
    serverError: 'Error al crear el proyecto. Por favor, inténtalo de nuevo.',
  },
}

/** Estado submitting en paso 3 */
export const Submitting: Story = {
  args: {
    templates: ALL_TEMPLATES,
    onSubmit: fn(),
    onCancel: fn(),
    isSubmitting: true,
  },
}

// ── Story 11.2 — customQuestion en datos de ejemplo del paso 3 ─────────────

/** Variante con pregunta custom del Builder — datos representativos para paso 3 */
export const ConPreguntaCustom: Story = {
  name: 'Con pregunta custom del Builder (paso 3)',
  args: {
    templates: ALL_TEMPLATES,
    onSubmit: fn(),
    onCancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Story 11.2 — El wizard en el paso 3 permite al Builder añadir una pregunta custom opcional para los Reviewers. Campo con contador de caracteres (máx 200).',
      },
    },
  },
}
