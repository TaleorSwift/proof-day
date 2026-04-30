// Story 10.2 — T6.4: Storybook story para ProjectTemplateSelector

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { ProjectTemplateSelector } from '@/components/projects/ProjectTemplateSelector'
import {
  ALL_TEMPLATES,
  TEMPLATE_SAAS,
} from '@/lib/fixtures/templates'

const meta = {
  title: 'Projects/ProjectTemplateSelector',
  component: ProjectTemplateSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    selectedId: {
      control: 'text',
      description: 'ID del template seleccionado, o null para ninguno',
    },
  },
} satisfies Meta<typeof ProjectTemplateSelector>

export default meta
type Story = StoryObj<typeof meta>

// ── Wrapper interactivo ────────────────────────────────────────────────────────
// Permite simular la selección real en Storybook sin necesidad de estado externo.

function InteractiveWrapper({
  initialSelectedId = null,
}: {
  initialSelectedId?: string | null
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)

  return (
    <div style={{ maxWidth: '500px' }}>
      <ProjectTemplateSelector
        templates={ALL_TEMPLATES}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

/** Estado inicial: ningún tipo seleccionado (selectedId = null) */
export const NingunoSeleccionado: Story = {
  render: () => <InteractiveWrapper initialSelectedId={null} />,
  args: {
    templates: ALL_TEMPLATES,
    selectedId: null,
    onSelect: fn(),
  },
}

/** Un template ya seleccionado al cargar */
export const UnoSeleccionado: Story = {
  render: () => <InteractiveWrapper initialSelectedId={TEMPLATE_SAAS.id} />,
  args: {
    templates: ALL_TEMPLATES,
    selectedId: TEMPLATE_SAAS.id,
    onSelect: fn(),
  },
}

/** Lista vacía de templates — solo botón "Sin tipo" */
export const SinTemplates: Story = {
  args: {
    templates: [],
    selectedId: null,
    onSelect: fn(),
  },
}
