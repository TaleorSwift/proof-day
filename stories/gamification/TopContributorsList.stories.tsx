import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TopContributorsList } from '@/components/gamification/TopContributorsList'
import type { TopContributor } from '@/lib/types/gamification'

const meta = {
  title: 'Gamification/TopContributorsList',
  component: TopContributorsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof TopContributorsList>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const contributor1: TopContributor = {
  userId: 'user-ana',
  name: 'Ana García',
  feedbackCount: 24,
}

const contributor2: TopContributor = {
  userId: 'user-bruno',
  name: 'Bruno López',
  feedbackCount: 18,
}

const contributor3: TopContributor = {
  userId: 'user-clara',
  name: 'Clara Martín',
  feedbackCount: 11,
}

const contributor4: TopContributor = {
  userId: 'user-diego',
  name: 'Diego Ruiz',
  feedbackCount: 6,
}

const contributor5: TopContributor = {
  userId: 'user-elena',
  name: 'Elena Torres',
  feedbackCount: 3,
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

// Lista vacía — mensaje "Aún no hay revisores en esta comunidad"
export const ListaVacia: Story = {
  name: 'Lista vacía',
  args: {
    contributors: [],
  },
}

// Lista con varios contributors — badge varía según posición (top-reviewer, insightful, changed-thinking)
export const ConContributors: Story = {
  name: 'Con contributors',
  args: {
    contributors: [contributor1, contributor2, contributor3, contributor4, contributor5],
  },
}

// Top 1 destacado — único contributor con badge top-reviewer
export const Top1Destacado: Story = {
  name: 'Top 1 destacado (único contributor)',
  args: {
    contributors: [contributor1],
  },
}
