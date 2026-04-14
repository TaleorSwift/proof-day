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
  slug: 'app-productividad-freelancers',
  title: 'App de productividad para freelancers',
  imageUrls: [],
  builderId: 'user-123',
  builderName: 'María García',
  problem: 'Los freelancers pierden tiempo gestionando proyectos en múltiples herramientas sin integración.',
  tagline: 'Gestiona todos tus clientes desde un solo lugar.',
  wouldUseCount: 12,
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
      slug: 'proyecto-sin-descripcion',
      title: 'Proyecto sin descripción ni imagen',
      imageUrls: [],
      status: 'live',
      builderId: 'user-456',
      wouldUseCount: 0,
    },
    communitySlug: 'tech-community',
    feedbackCount: 1,
  },
}

// Story 9.6: nuevas stories

export const ConImagenYTagline: Story = {
  args: {
    project: {
      ...baseProject,
      imageUrls: ['https://picsum.photos/seed/proj2/400/300'],
      status: 'live',
      tagline: 'Gestiona todos tus clientes desde un solo lugar.',
      wouldUseCount: 8,
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 3,
    initialLikeCount: 7,
  },
}

export const SinTaglineConProblem: Story = {
  args: {
    project: {
      ...baseProject,
      imageUrls: [],
      status: 'live',
      tagline: null,
      problem: 'Los freelancers pierden tiempo gestionando proyectos en múltiples herramientas.',
      wouldUseCount: 5,
    },
    communitySlug: 'startup-madrid',
    feedbackCount: 4,
    initialLikeCount: 9,
  },
}
