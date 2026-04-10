import type { Meta, StoryObj } from '@storybook/react'
import { ProjectFeed } from '@/components/projects/ProjectFeed'
import type { ProjectListItem } from '@/lib/api/projects'

const meta: Meta<typeof ProjectFeed> = {
  title: 'Projects/ProjectFeed',
  component: ProjectFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ProjectFeed>

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const liveProject1: ProjectListItem = {
  id: 'proj-live-1',
  title: 'App de productividad para freelancers',
  imageUrls: ['https://picsum.photos/seed/proj1/400/300'],
  status: 'live',
  builderId: 'user-1',
  createdAt: '2026-01-10T10:00:00Z',
}

const liveProject2: ProjectListItem = {
  id: 'proj-live-2',
  title: 'Marketplace de servicios locales',
  imageUrls: [],
  status: 'live',
  builderId: 'user-2',
  createdAt: '2026-01-08T10:00:00Z',
}

const inactiveProject1: ProjectListItem = {
  id: 'proj-inactive-1',
  title: 'Plataforma de mentoring P2P',
  imageUrls: ['https://picsum.photos/seed/proj3/400/300'],
  status: 'inactive',
  builderId: 'user-3',
  createdAt: '2025-11-01T10:00:00Z',
}

const inactiveProject2: ProjectListItem = {
  id: 'proj-inactive-2',
  title: 'Herramienta de retrospectivas asíncronas',
  imageUrls: [],
  status: 'inactive',
  builderId: 'user-4',
  createdAt: '2025-10-15T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const SoloEnValidacion: Story = {
  args: {
    projects: [liveProject1, liveProject2],
    communitySlug: 'startup-madrid',
  },
}

export const SoloCerrados: Story = {
  args: {
    projects: [inactiveProject1, inactiveProject2],
    communitySlug: 'startup-madrid',
  },
}

export const Mixto: Story = {
  args: {
    // Array mezclado — ProjectFeed debe ordenarlos internamente (live arriba, inactive abajo)
    projects: [inactiveProject1, liveProject1, inactiveProject2, liveProject2],
    communitySlug: 'startup-madrid',
  },
}

export const VacioGlobal: Story = {
  args: {
    projects: [],
    communitySlug: 'startup-madrid',
  },
}
