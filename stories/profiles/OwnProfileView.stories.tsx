// OwnProfileView es un Client Component con estado interno (isEditing).
// Las stories cubren: modo vista con/sin bio, con/sin intereses, y modo edición.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent } from 'storybook/test'
import { OwnProfileView } from '@/components/profiles/OwnProfileView'
import {
  profileAlexWithStats,
  profileSaraWithStats,
  profileNewUserWithStats,
} from '@/lib/fixtures/profiles'
import type { ProfileWithStats } from '@/lib/types/profiles'

const meta = {
  title: 'Profiles/OwnProfileView',
  component: OwnProfileView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/profile' },
    },
  },
} satisfies Meta<typeof OwnProfileView>

export default meta
type Story = StoryObj<typeof meta>

// ── Modo vista ─────────────────────────────────────────────────────────────────

/** Vista completa: con bio, con intereses y con métricas. */
export const ConBioEIntereses: Story = {
  args: {
    profile: profileAlexWithStats,
  },
}

/** Vista con bio pero sin intereses. */
export const ConBioSinIntereses: Story = {
  args: {
    profile: {
      ...profileSaraWithStats,
      interests: [],
    } satisfies ProfileWithStats,
  },
}

/** Vista sin bio y sin intereses — usuario recién registrado. */
export const SinBioSinIntereses: Story = {
  args: {
    profile: profileNewUserWithStats,
  },
}

/** Vista con intereses pero sin bio. */
export const SinBioConIntereses: Story = {
  args: {
    profile: {
      ...profileAlexWithStats,
      bio: null,
    } satisfies ProfileWithStats,
  },
}

/** Vista con métricas altas — feedbackCount y projectCount con números grandes. */
export const ConMetricasAltas: Story = {
  args: {
    profile: {
      ...profileAlexWithStats,
      feedbackCount: 142,
      projectCount: 37,
    } satisfies ProfileWithStats,
  },
}

// ── Modo edición ───────────────────────────────────────────────────────────────

/**
 * ModoEdicion — la play function hace click en "Editar perfil" para activar el formulario.
 * El formulario interno (ProfileForm) usa window.fetch; el mock evita errores de red.
 */
export const ModoEdicion: Story = {
  args: {
    profile: profileAlexWithStats,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/profile' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    await user.click(canvas.getByRole('button', { name: /Editar perfil/i }))
  },
}
