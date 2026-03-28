import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCard } from '@/components/projects/ProjectCard'

const meta: Meta<typeof ProjectCard> = {
  title: 'projects/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    communitySlug: 'startup-madrid',
  },
}

export default meta
type Story = StoryObj<typeof meta>

const liveProject = {
  id: 'proj-1',
  title: 'Mi app de productividad para equipos remotos',
  imageUrls: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800'],
  status: 'live' as const,
  builderId: 'user-1',
}

const draftProject = {
  id: 'proj-2',
  title: 'Plataforma de aprendizaje colaborativo',
  imageUrls: [],
  status: 'draft' as const,
  builderId: 'user-2',
}

const inactiveProject = {
  id: 'proj-3',
  title: 'Marketplace de servicios freelance',
  imageUrls: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800'],
  status: 'inactive' as const,
  builderId: 'user-3',
}

export const Live: Story = {
  args: {
    project: liveProject,
    feedbackCount: 5,
    proofScore: null,
  },
}

export const LiveWithScore: Story = {
  name: 'Live — Proof Score Promising',
  args: {
    project: liveProject,
    feedbackCount: 8,
    proofScore: 'Promising',
  },
}

export const Draft: Story = {
  args: {
    project: draftProject,
    feedbackCount: 0,
    proofScore: null,
  },
}

export const Inactive: Story = {
  args: {
    project: inactiveProject,
    feedbackCount: 3,
    proofScore: 'Needs iteration',
  },
}

export const Loading: Story = {
  args: {
    project: liveProject,
    isLoading: true,
  },
}
