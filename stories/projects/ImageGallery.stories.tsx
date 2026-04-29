import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from 'storybook/test'
import { ImageGallery } from '@/components/projects/ImageGallery'

const meta = {
  title: 'Projects/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ImageGallery>

export default meta
type Story = StoryObj<typeof meta>

// ── Fixtures ───────────────────────────────────────────────────────────────────

const PROJECT_ID = 'c0000000-0000-4000-8000-000000000099'

const sampleImages = [
  {
    path: 'user-1/proj-1/imagen-principal.jpg',
    url: 'https://picsum.photos/seed/gallery-1/800/600',
  },
  {
    path: 'user-1/proj-1/imagen-secundaria.jpg',
    url: 'https://picsum.photos/seed/gallery-2/800/600',
  },
  {
    path: 'user-1/proj-1/imagen-terciaria.jpg',
    url: 'https://picsum.photos/seed/gallery-3/800/600',
  },
]

// ── Stories ────────────────────────────────────────────────────────────────────

/**
 * ReadOnly — galería en modo solo lectura.
 * No se muestran controles de borrar ni ordenar.
 */
export const ReadOnly: Story = {
  args: {
    projectId: PROJECT_ID,
    initialImages: sampleImages,
    isEditable: false,
  },
}

/**
 * SinImagenes — galería vacía en modo solo lectura.
 */
export const SinImagenes: Story = {
  args: {
    projectId: PROJECT_ID,
    initialImages: [],
    isEditable: false,
  },
}

/**
 * Editable — galería con imágenes y controles de borrar/ordenar visibles.
 * No se puede interactuar con el upload real en Storybook (requiere Storage).
 */
export const Editable: Story = {
  args: {
    projectId: PROJECT_ID,
    initialImages: sampleImages,
    isEditable: true,
  },
}

/**
 * EditableConfirmacionBorrado — click en eliminar muestra diálogo de confirmación inline.
 * El botón "Eliminar imagen" se muestra para todas las imágenes cuando images.length > 1.
 * La play function activa el flujo de confirmación sobre la primera imagen.
 */
export const EditableConfirmacionBorrado: Story = {
  args: {
    projectId: PROJECT_ID,
    initialImages: sampleImages,
    isEditable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    // Click en "Eliminar imagen" de la primera imagen (índice 0)
    const deleteButtons = canvas.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(deleteButtons[0])

    // El diálogo de confirmación inline debe aparecer con el texto y botones de acción
    await expect(await canvas.findByText('Eliminar?')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Si' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'No' })).toBeInTheDocument()
  },
}
