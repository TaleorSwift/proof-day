import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCard } from '@/components/projects/ProjectCard'

const meta: Meta<typeof ProjectCard> = {
  title: 'Projects/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ProjectCard>

const baseProject = {
  id: 'proj-001',
  title: 'App de productividad para freelancers',
  imageUrls: [],
  builderId: 'user-123',
  builderName: 'María García',
  problem: 'Los freelancers pierden tiempo gestionando proyectos en múltiples herramientas sin integración.',
}

export const LiveConImagen: Story = {
  args: {
    project: {
      ...baseProject,
      imageUrls: ['https://picsum.photos/seed/proj1/400/300'],
      status: 'live',
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 5,
    initialLikeCount: 12,
  },
}

export const LiveSinImagen: Story = {
  args: {
    project: {
      ...baseProject,
      status: 'live',
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 2,
    initialLikeCount: 4,
  },
}

export const Cerrado: Story = {
  args: {
    project: {
      ...baseProject,
      status: 'inactive',
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 18,
    initialLikeCount: 31,
  },
}

export const Borrador: Story = {
  args: {
    project: {
      ...baseProject,
      title: 'Mi idea en borrador',
      status: 'draft',
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 0,
    initialLikeCount: 0,
  },
}

export const SinDescripcion: Story = {
  args: {
    project: {
      id: 'proj-002',
      title: 'Proyecto sin descripción ni imagen',
      imageUrls: [],
      status: 'live',
      builderId: 'user-456',
    },
    communitySlug: 'tech-community',
    feedbackCount: 1,
  },
}
