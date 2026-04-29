import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProofScoreWaiting } from '@/components/proof-score/ProofScoreWaiting'

// ProofScoreWaiting muestra el progreso hacia el mínimo de feedbacks requeridos (3).
// MIN_FEEDBACKS_FOR_SCORE = 3 (lib/utils/proof-score.ts)

const meta = {
  title: 'ProofScore/ProofScoreWaiting',
  component: ProofScoreWaiting,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProofScoreWaiting>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

// Estado de carga — skeleton mientras se resuelve el ProofScore
export const Cargando: Story = {
  name: 'Cargando (isLoading = true)',
  args: {
    feedbackCount: 0,
    isLoading: true,
  },
}

// Sin ningún feedback aún — "Faltan 3 feedbacks para tu señal", progreso 0%
export const SinFeedbacks: Story = {
  name: 'Sin feedbacks (0 / 3)',
  args: {
    feedbackCount: 0,
    isLoading: false,
  },
}

// Un feedback recibido — "Faltan 2 feedbacks para tu señal", progreso ~33%
export const UnFeedback: Story = {
  name: 'Un feedback recibido (1 / 3)',
  args: {
    feedbackCount: 1,
    isLoading: false,
  },
}

// Dos feedbacks recibidos — "Faltan 1 feedback para tu señal" (singular), progreso ~67%
export const DosFeedbacks: Story = {
  name: 'Dos feedbacks recibidos (2 / 3, texto singular)',
  args: {
    feedbackCount: 2,
    isLoading: false,
  },
}

// Mínimo alcanzado — "Calculando tu Proof Score...", progreso 100%
export const MinimoAlcanzado: Story = {
  name: 'Mínimo alcanzado (3 / 3) — calculando',
  args: {
    feedbackCount: 3,
    isLoading: false,
  },
}
