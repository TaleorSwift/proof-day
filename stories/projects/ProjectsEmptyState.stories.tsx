import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'

const meta = {
  title: 'Projects/ProjectsEmptyState',
  component: ProjectsEmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/producto-alpha',
      },
    },
  },
} satisfies Meta<typeof ProjectsEmptyState>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * SinPermiso — empty state sin botón de creación.
 * Muestra solo el mensaje "Esta comunidad no tiene proyectos aún".
 */
export const SinPermiso: Story = {
  name: 'Sin permiso de crear',
  args: {
    communitySlug: 'producto-alpha',
    canCreate: false,
  },
}

/**
 * ConPermiso — empty state con botón "Crear el primero".
 * El botón enlaza a /communities/{slug}/projects/new.
 */
export const ConPermiso: Story = {
  name: 'Con permiso de crear',
  args: {
    communitySlug: 'producto-alpha',
    canCreate: true,
  },
}
