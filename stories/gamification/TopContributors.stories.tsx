import type { Meta, StoryObj } from '@storybook/react'
import { TopContributorsList } from '@/components/gamification/TopContributorsList'
import type { TopContributor } from '@/lib/types/gamification'

const meta: Meta<typeof TopContributorsList> = {
  title: 'Gamification/TopContributors',
  component: TopContributorsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TopContributorsList>

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

export const ConDatos: Story = {
  args: {
    contributors: [contributor1, contributor2, contributor3, contributor4, contributor5],
  },
}

export const UnRevisor: Story = {
  args: {
    contributors: [contributor1],
  },
}

export const SinRevisores: Story = {
  args: {
    contributors: [],
  },
}
