import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunityFeedHeader } from '@/components/communities/CommunityFeedHeader'

/**
 * CommunityFeedHeader — cabecera del feed de una comunidad.
 * Muestra el nombre de la comunidad, subtítulo y el botón "+ Lanzar idea"
 * que abre el modal LaunchIdeaModal.
 */
const meta = {
  title: 'Communities/CommunityFeedHeader',
  component: CommunityFeedHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CommunityFeedHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Cabecera de la comunidad principal del proyecto. */
export const Default: Story = {
  args: {
    communityName: 'Producto Alpha',
    communitySlug: 'producto-alpha',
  },
}

/** Cabecera con nombre de comunidad largo para verificar el layout. */
export const NombreLargo: Story = {
  name: 'Nombre de comunidad largo',
  args: {
    communityName: 'Comunidad de Startups en Etapa Pre-Seed — Barcelona 2026',
    communitySlug: 'startups-barcelona-2026',
  },
}

/** Cabecera para comunidad Startup Lab. */
export const StartupLab: Story = {
  name: 'Startup Lab',
  args: {
    communityName: 'Startup Lab',
    communitySlug: 'startup-lab',
  },
}
