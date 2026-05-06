import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeedbackQualityStats } from '@/components/feedback/FeedbackQualityStats'

// Story 11.3 — Filtro de completitud del feedback + quality warning

const meta = {
  title: 'Feedback/FeedbackQualityStats',
  component: FeedbackQualityStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FeedbackQualityStats>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: Sin feedbacks — no renderiza nada
// ---------------------------------------------------------------------------

export const SinFeedbacks: Story = {
  name: 'Sin feedbacks — no renderiza nada',
  args: {
    feedbacks: [],
    qualityThreshold: 0.6,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Cuando no hay feedbacks, el componente no renderiza nada. AC-7.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Mayoría completos — sin warning
// ---------------------------------------------------------------------------

export const MayoriaCompletos: Story = {
  name: 'Mayoría completos — sin warning',
  args: {
    feedbacks: [
      { qualityScore: 1.0 },
      { qualityScore: 0.9 },
      { qualityScore: 0.8 },
      { qualityScore: 0.7 },
      { qualityScore: 0.6 },
    ],
    qualityThreshold: 0.6,
  },
  parameters: {
    docs: {
      description: {
        story:
          '5 feedbacks, todos completos (quality_score >= 0.6). Muestra "5 feedbacks completos de 5 totales". No aparece el warning. AC-4, AC-6.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Mayoría incompletos — warning visible
// ---------------------------------------------------------------------------

export const MayoriaIncompletos: Story = {
  name: 'Mayoría incompletos — warning visible',
  args: {
    feedbacks: [
      { qualityScore: 0.9 },
      { qualityScore: 0.7 },
      { qualityScore: 0.2 },
      { qualityScore: 0.1 },
      { qualityScore: 0.0 },
    ],
    qualityThreshold: 0.6,
  },
  parameters: {
    docs: {
      description: {
        story:
          '5 feedbacks, 2 completos (60% incompletos > 40%). Muestra "2 feedbacks completos de 5 totales" y el banner de warning naranja. AC-4, AC-5.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Exacto umbral — ratio exactamente 40%, sin warning
// ---------------------------------------------------------------------------

export const ExactoUmbral: Story = {
  name: 'Exacto umbral 40% — sin warning',
  args: {
    feedbacks: [
      { qualityScore: 0.9 },
      { qualityScore: 0.8 },
      { qualityScore: 0.6 },
      { qualityScore: 0.2 },
      { qualityScore: 0.1 },
    ],
    qualityThreshold: 0.6,
  },
  parameters: {
    docs: {
      description: {
        story:
          '5 feedbacks, 3 completos y 2 incompletos. incompleteRatio = 2/5 = 0.4, que no supera el umbral del 40%. El warning NO aparece. AC-6.',
      },
    },
  },
}
