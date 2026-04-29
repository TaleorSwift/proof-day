import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { ImageUpload } from '@/components/projects/ImageUpload'
import { PROJECT_IMAGES_MAX_COUNT } from '@/lib/types/projects'

const meta = {
  title: 'Projects/ImageUpload',
  component: ImageUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ImageUpload>

export default meta
type Story = StoryObj<typeof meta>

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Inicial — no hay imágenes subidas todavía.
 * Muestra el botón "Añadir imagen" con el texto completo.
 */
export const Inicial: Story = {
  args: {
    projectId: 'proj-001',
    currentCount: 0,
    onUploaded: fn(),
  },
}

/**
 * ConImagenesPrevias — hay imágenes subidas (2 de 5).
 * El botón muestra el contador "Añadir imagen (2/5)".
 */
export const ConImagenesPrevias: Story = {
  name: 'Con imágenes previas (2/5)',
  args: {
    projectId: 'proj-001',
    currentCount: 2,
    onUploaded: fn(),
  },
}

/**
 * LimiteAlcanzado — se ha llegado al máximo de imágenes.
 * El componente devuelve null (no renderiza nada visible).
 */
export const LimiteAlcanzado: Story = {
  name: 'Límite alcanzado (5/5)',
  args: {
    projectId: 'proj-001',
    currentCount: PROJECT_IMAGES_MAX_COUNT,
    onUploaded: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          `Cuando currentCount >= PROJECT_IMAGES_MAX_COUNT (${PROJECT_IMAGES_MAX_COUNT}), el componente devuelve null y no renderiza nada. El espacio en blanco es el comportamiento esperado.`,
      },
    },
  },
}

/**
 * ErrorValidacion — muestra cómo se vería el componente justo antes de
 * mostrar el error (el mensaje de error se dispara desde el handler de fichero).
 * No es posible pre-popular el estado de error directamente; se documenta
 * el estado base con currentCount = 0.
 */
export const UltimaImagenDisponible: Story = {
  name: 'Última imagen disponible (4/5)',
  args: {
    projectId: 'proj-001',
    currentCount: PROJECT_IMAGES_MAX_COUNT - 1,
    onUploaded: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Solo queda un slot disponible. El botón refleja el contador máximo menos uno.',
      },
    },
  },
}
