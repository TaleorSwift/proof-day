import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InviteErrorState } from '@/components/invitations/InviteErrorState'

const meta = {
  title: 'Invitations/InviteErrorState',
  component: InviteErrorState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof InviteErrorState>

export default meta
type Story = StoryObj<typeof meta>

// Token inválido o inexistente (AC 7 — story 2.2)
// Renderizado por app/invite/[token]/page.tsx cuando el token no existe en la BD o used_at != null
export const TokenInvalido: Story = {
  args: {
    message: 'Este link ya no es válido',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renderizado por `app/invite/[token]/page.tsx` cuando el token no existe en la BD o `used_at != null`. Cubre tanto tokens inexistentes como ya usados (mismo mensaje unificado, AC 7 — story 2.2 CR#5 M5).',
      },
    },
  },
}

// Error de procesamiento durante el join
export const ErrorProcesamiento: Story = {
  args: {
    message: 'Error al procesar el link. Por favor, inténtalo de nuevo.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renderizado por `app/invite/[token]/page.tsx` cuando falla la operación de join (error de base de datos u otro error de procesamiento).',
      },
    },
  },
}
