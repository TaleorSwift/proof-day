import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import {
  projectPulseCheck,
  projectDocBridge,
  projectCarbonLedger,
  projectRetroReplay,
  projectDraftNew,
  projectLiveIterate,
} from '@/lib/fixtures/projects'

const meta = {
  title: 'Projects/ProjectGrid',
  component: ProjectGrid,
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
} satisfies Meta<typeof ProjectGrid>

export default meta
type Story = StoryObj<typeof meta>

const COMMUNITY_SLUG = 'producto-alpha'

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * ConProyectos — grid con varios proyectos en distintos estados.
 */
export const ConProyectos: Story = {
  args: {
    communitySlug: COMMUNITY_SLUG,
    projects: [
      projectPulseCheck,
      projectDocBridge,
      projectCarbonLedger,
      projectRetroReplay,
      projectDraftNew,
      projectLiveIterate,
    ],
    isLoading: false,
    canCreate: false,
  },
}

/**
 * Cargando — muestra 6 skeletons mientras se obtienen los datos.
 */
export const Cargando: Story = {
  args: {
    communitySlug: COMMUNITY_SLUG,
    projects: [],
    isLoading: true,
    canCreate: false,
  },
}

/**
 * VacioSinPermiso — sin proyectos y sin permiso de creación.
 * Muestra el empty state sin el botón "Crear el primero".
 */
export const VacioSinPermiso: Story = {
  name: 'Vacío — sin permiso de crear',
  args: {
    communitySlug: COMMUNITY_SLUG,
    projects: [],
    isLoading: false,
    canCreate: false,
  },
}

/**
 * VacioConPermiso — sin proyectos pero con permiso de creación.
 * Muestra el empty state con el botón "Crear el primero".
 */
export const VacioConPermiso: Story = {
  name: 'Vacío — con permiso de crear',
  args: {
    communitySlug: COMMUNITY_SLUG,
    projects: [],
    isLoading: false,
    canCreate: true,
  },
}

/**
 * UnProyecto — grid con un único proyecto.
 */
export const UnProyecto: Story = {
  name: 'Un único proyecto',
  args: {
    communitySlug: COMMUNITY_SLUG,
    projects: [projectPulseCheck],
    isLoading: false,
    canCreate: false,
  },
}
