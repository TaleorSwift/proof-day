// CommunitySwitcherClient usa usePathname de next/navigation para extraer el slug activo.
// Se proporciona la ruta actual via parameters.nextjs.navigation.pathname.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CommunitySwitcherClient } from '@/components/communities/CommunitySwitcherClient'

const makeCommunity = (id: string, name: string, slug: string) => ({
  id,
  name,
  slug,
  description: `Descripción de ${name}.`,
  image_url: null,
  created_by: 'user-001',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  member_count: 5,
})

const comunidades = [
  makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha'),
  makeCommunity('comm-002', 'Startup Lab', 'startup-lab'),
  makeCommunity('comm-003', 'Innovación 2026', 'innovacion-2026'),
]

const meta = {
  title: 'Communities/CommunitySwitcherClient',
  component: CommunitySwitcherClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/producto-alpha',
        push: () => {},
      },
    },
  },
} satisfies Meta<typeof CommunitySwitcherClient>

export default meta
type Story = StoryObj<typeof meta>

/** Usuario en la comunidad "Producto Alpha" — activa resaltada en el dropdown. */
export const Default: Story = {
  args: {
    communities: comunidades,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/producto-alpha',
        push: () => {},
      },
    },
  },
}

/** Usuario en "Startup Lab" — segunda comunidad activa. */
export const StartupLabActivo: Story = {
  name: 'Startup Lab activo',
  args: {
    communities: comunidades,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/startup-lab',
        push: () => {},
      },
    },
  },
}

/** Ruta /communities/new — slug reservado, no hay activa seleccionada. */
export const RutaReservada: Story = {
  name: 'Ruta reservada (/communities/new)',
  args: {
    communities: comunidades,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/new',
        push: () => {},
      },
    },
  },
}

/** Una sola comunidad — muestra el nombre como texto sin dropdown. */
export const UnaSolaComunidad: Story = {
  name: 'Una sola comunidad (sin dropdown)',
  args: {
    communities: [makeCommunity('comm-001', 'Producto Alpha', 'producto-alpha')],
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities/producto-alpha',
        push: () => {},
      },
    },
  },
}

/** Sin comunidades — renderiza null. */
export const SinComunidades: Story = {
  name: 'Sin comunidades (oculto)',
  args: {
    communities: [],
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/communities',
        push: () => {},
      },
    },
  },
}
