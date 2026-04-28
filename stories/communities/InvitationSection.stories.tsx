// InvitationSection es un Client Component con estado local + fetch.
// Los estados que requieren interacción usan play functions con mock de window.fetch.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from 'storybook/test'
import InvitationSection from '@/components/communities/InvitationSection'

const meta = {
  title: 'Communities/InvitationSection',
  component: InvitationSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  args: {
    communityId: 'community-test-123',
  },
} satisfies Meta<typeof InvitationSection>

export default meta
type Story = StoryObj<typeof meta>

// Estado inicial — sin links generados todavía.
export const Vacio: Story = {}

// Estado con 2 links generados.
// La play function mockea window.fetch para que generateInvitationLink resuelva inmediatamente.
export const ConLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    let callCount = 0
    window.fetch = async () => {
      callCount++
      const token = `token-${callCount}-abc123`
      return new Response(
        JSON.stringify({ data: { token } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const user = userEvent.setup()
    // Generar primer link
    await user.click(canvas.getByRole('button', { name: /Generar link/i }))
    // Generar segundo link
    await user.click(canvas.getByRole('button', { name: /Generar link/i }))

    window.fetch = originalFetch
  },
}

// Estado "Copiado" — tras hacer click en "Copiar link" el botón muestra feedback visual.
export const Copiado: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    window.fetch = async () =>
      new Response(
        JSON.stringify({ data: { token: 'token-copiado-xyz' } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )

    // Mockear clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => Promise.resolve() },
      writable: true,
      configurable: true,
    })

    const user = userEvent.setup()
    await user.click(canvas.getByRole('button', { name: /Generar link/i }))

    // Esperar a que aparezca el botón "Copiar link"
    const copyBtn = await canvas.findByRole('button', { name: /Copiar link/i })
    await user.click(copyBtn)

    // El botón debe mostrar "¡Copiado!"
    await expect(canvas.getByRole('button', { name: /¡Copiado!/i })).toBeInTheDocument()

    window.fetch = originalFetch
  },
}

// Estado de error — generateInvitationLink lanza error → mensaje de error visible.
export const ErrorFetch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    window.fetch = async () =>
      new Response(
        JSON.stringify({ error: 'Error al generar el link de invitación' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )

    const user = userEvent.setup()
    await user.click(canvas.getByRole('button', { name: /Generar link/i }))

    window.fetch = originalFetch
  },
}
