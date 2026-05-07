// Story 12.4 — Storybook stories para AISummaryCard

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AISummaryCard } from '@/components/projects/AISummaryCard'
import { aiSummaryPulseCheck, aiSummaryDocBridge } from '@/lib/fixtures/ai-summaries'

const meta = {
  title: 'Projects/AISummaryCard',
  component: AISummaryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    summary: { control: false },
    isLoading: { control: 'boolean' },
  },
} satisfies Meta<typeof AISummaryCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Estado loading — muestra el skeleton de 3 líneas mientras se carga la síntesis.
 */
export const Loading: Story = {
  args: {
    summary: null,
    isLoading: true,
  },
}

/**
 * Estado vacío — el proyecto aún no tiene suficientes feedbacks para generar síntesis.
 */
export const Empty: Story = {
  args: {
    summary: null,
    isLoading: false,
  },
}

/**
 * Estado con datos — síntesis completa con insights (bullets) en el contenido.
 * Muestra el banner "Generado por IA", el texto del resumen, la lista de insights y el footer.
 */
export const ConDatos: Story = {
  args: {
    summary: aiSummaryPulseCheck,
    isLoading: false,
  },
}

/**
 * Estado con datos pero sin insights — el contenido es texto plano sin bullets.
 * No se renderiza la sección de insights.
 */
export const SinInsights: Story = {
  args: {
    summary: aiSummaryDocBridge,
    isLoading: false,
  },
}
