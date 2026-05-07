import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProofScoreSidebar } from '@/components/proof-score/ProofScoreSidebar'

const meta = {
  title: 'ProofScore/ProofScoreSidebar',
  component: ProofScoreSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProofScoreSidebar>

export default meta
type Story = StoryObj<typeof meta>

// ProofScoreSidebar es 'use client' y hace fetch vía getProofScore.
// En Storybook se renderiza en estado de carga inicial (spinner/waiting).

export const BuilderSinDecision: Story = {
  name: 'Builder — sin decision registrada (carga inicial)',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
    feedbackCount: 5,
    initialDecision: null,
  },
}

export const BuilderConDecisionIterar: Story = {
  name: 'Builder — con decision: iterar',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
    feedbackCount: 8,
    initialDecision: 'iterate',
  },
}

export const BuilderConDecisionEscalar: Story = {
  name: 'Builder — con decision: escalar',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
    feedbackCount: 12,
    initialDecision: 'scale',
  },
}

export const BuilderConDecisionAbandonar: Story = {
  name: 'Builder — con decision: abandonar',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
    feedbackCount: 3,
    initialDecision: 'abandon',
  },
}

export const NoBuilder: Story = {
  name: 'No Builder (oculto — devuelve null)',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: false,
    feedbackCount: 5,
    initialDecision: null,
  },
}

export const SinFeedbacks: Story = {
  name: 'Builder — sin feedbacks aún',
  args: {
    projectId: 'proj-storybook-001',
    isBuilder: true,
    feedbackCount: 0,
    initialDecision: null,
  },
}

// ── Story 13.8 — Variantes con interpretación contextual ─────────────────────
// Nota: estas stories renderizan la sidebar en estado de carga inicial.
// El fetch real a la API de score e interpretación ocurrirá si hay servidor.
// Para visualizar el estado final con interpretación, se puede usar un mock
// de fetch en el decorator si se configura MSW en Storybook.

export const WithPromisingInterpretation: Story = {
  name: 'Con interpretación — Promising',
  args: {
    projectId: 'proj-promising-001',
    isBuilder: true,
    feedbackCount: 8,
    initialDecision: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra la sidebar cuando el Proof Score es Promising y la interpretación contextual está disponible. ' +
          'El componente carga el score y luego dispara la llamada de interpretación de forma asíncrona.',
      },
    },
  },
}

export const WithNeedsIterationInterpretation: Story = {
  name: 'Con interpretación — Needs Iteration',
  args: {
    projectId: 'proj-needs-iteration-001',
    isBuilder: true,
    feedbackCount: 5,
    initialDecision: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra la sidebar cuando el Proof Score es Needs Iteration. ' +
          'La interpretación identifica señales mixtas y sugiere iterar sobre el problema o la solución.',
      },
    },
  },
}

export const InterpretationLoading: Story = {
  name: 'Interpretación en estado de carga',
  args: {
    projectId: 'proj-loading-001',
    isBuilder: true,
    feedbackCount: 6,
    initialDecision: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Muestra el skeleton loader mientras se genera la interpretación contextual del Proof Score. ' +
          'El score ya está disponible pero Ollama aún está procesando el prompt.',
      },
    },
  },
}
