// ReciprocitySettings es un Client Component con estado local + fetch.
// Story 11.6: Admin puede configurar el umbral de reciprocidad de su comunidad.
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, fireEvent } from 'storybook/test'
import ReciprocitySettings from '@/components/communities/ReciprocitySettings'

const meta = {
  title: 'Communities/ReciprocitySettings',
  component: ReciprocitySettings,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  args: {
    communityId: 'community-test-123',
    currentThreshold: 3,
  },
} satisfies Meta<typeof ReciprocitySettings>

export default meta
type Story = StoryObj<typeof meta>

// Valor por defecto — threshold = 3, botón habilitado.
export const ValorDefecto: Story = {}

// Gate desactivado — threshold = 0.
export const GateDesactivado: Story = {
  args: {
    currentThreshold: 0,
  },
}

// Valor inválido — campo muestra error de validación, botón deshabilitado.
export const ValorInvalido: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByTestId('reciprocity-threshold-input')

    // Simular entrada de valor fuera de rango
    fireEvent.change(input, { target: { value: '11' } })

    // El botón debe estar deshabilitado
    const btn = canvas.getByTestId('save-reciprocity-btn')
    await expect(btn).toBeDisabled()
  },
}

// Estado guardando — botón muestra "Guardando..." mientras la petición está en curso.
export const Guardando: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    // Fetch que tarda indefinidamente para mantener el estado "Guardando..."
    window.fetch = async () => new Promise(() => {})

    try {
      const user = userEvent.setup()
      await user.click(canvas.getByTestId('save-reciprocity-btn'))

      // El botón debe mostrar "Guardando..."
      await expect(canvas.getByTestId('save-reciprocity-btn')).toHaveTextContent('Guardando...')
    } finally {
      window.fetch = originalFetch
    }
  },
}

// Guardado con éxito — muestra feedback visual de confirmación.
export const GuardadoExito: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    window.fetch = async () =>
      new Response(
        JSON.stringify({ data: { id: 'community-test-123', reciprocityThreshold: 3 } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )

    try {
      const user = userEvent.setup()
      await user.click(canvas.getByTestId('save-reciprocity-btn'))

      // El feedback de éxito debe aparecer
      await expect(
        await canvas.findByTestId('reciprocity-saved-feedback')
      ).toBeInTheDocument()
    } finally {
      window.fetch = originalFetch
    }
  },
}

// Error al guardar — muestra mensaje de error de la API.
export const ErrorGuardado: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const originalFetch = window.fetch

    window.fetch = async () =>
      new Response(
        JSON.stringify({ error: 'Solo el admin puede cambiar esta configuración', code: 'FORBIDDEN' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )

    try {
      const user = userEvent.setup()
      await user.click(canvas.getByTestId('save-reciprocity-btn'))

      // El mensaje de error debe aparecer
      await expect(
        await canvas.findByText(/Solo el admin puede cambiar esta configuración/i)
      ).toBeInTheDocument()
    } finally {
      window.fetch = originalFetch
    }
  },
}
