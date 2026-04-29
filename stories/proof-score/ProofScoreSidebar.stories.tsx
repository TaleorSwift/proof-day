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
