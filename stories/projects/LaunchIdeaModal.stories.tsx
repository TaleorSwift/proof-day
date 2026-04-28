import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { within, userEvent } from 'storybook/test'
import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'

const meta = {
  title: 'Projects/LaunchIdeaModal',
  component: LaunchIdeaModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof LaunchIdeaModal>

export default meta
type Story = StoryObj<typeof meta>

function EstadoVacioTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <LaunchIdeaModal
      open={open}
      onOpenChange={setOpen}
      communitySlug="startup-madrid"
    />
  )
}

function ChipsSeleccionadosTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p style={{ padding: '16px', color: '#6B6B63', fontSize: '14px' }}>
        Abre el modal e interactúa con los chips de feedback.
      </p>
      <LaunchIdeaModal
        open={open}
        onOpenChange={setOpen}
        communitySlug="startup-madrid"
      />
    </div>
  )
}

function EstadoCargandoTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <LaunchIdeaModal
      open={open}
      onOpenChange={setOpen}
      communitySlug="startup-madrid"
    />
  )
}

function ConDatosRellenosTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p style={{ padding: '16px', color: '#6B6B63', fontSize: '14px' }}>
        Modal con campos pre-rellenados — rellenar manualmente para ver el estado completo.
      </p>
      <LaunchIdeaModal
        open={open}
        onOpenChange={setOpen}
        communitySlug="startup-madrid"
      />
    </div>
  )
}

async function rellenarCamposRequeridos(
  canvas: ReturnType<typeof within>,
  user: ReturnType<typeof userEvent.setup>
) {
  await user.type(canvas.getByTestId('modal-field-title'), 'Idea de demostración')
  await user.type(canvas.getByTestId('modal-field-tagline'), 'El mejor tagline del mundo')
  await user.type(canvas.getByTestId('modal-field-problem'), 'Los desarrolladores no tienen tiempo para escribir tests')
  await user.type(canvas.getByTestId('modal-field-solution'), 'Un sistema automatizado de generación de tests')
  await user.type(canvas.getByTestId('modal-field-hypothesis'), 'Si automatizamos los tests, el tiempo de desarrollo baja un 30%')
}

function ErrorServidorTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <LaunchIdeaModal
      open={open}
      onOpenChange={setOpen}
      communitySlug="startup-madrid"
    />
  )
}

function ConTodasLasImagenesTemplate() {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <p style={{ padding: '16px', color: '#6B6B63', fontSize: '14px' }}>
        Estado con 3 imágenes subidas — el botón &quot;Añadir&quot; queda oculto al alcanzar el límite (MAX_MODAL_IMAGES = 3).
        Interactúa manualmente con el uploader para ver el estado.
      </p>
      <LaunchIdeaModal
        open={open}
        onOpenChange={setOpen}
        communitySlug="startup-madrid"
      />
    </div>
  )
}

export const EstadoVacio: Story = {
  render: () => <EstadoVacioTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
}

export const ChipsSeleccionados: Story = {
  render: () => <ChipsSeleccionadosTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    // Hace click en el primer chip de feedback ('Claridad del problema')
    await user.click(canvas.getByRole('button', { name: 'Claridad del problema' }))
  },
}

export const EstadoCargandoManual: Story = {
  name: 'EstadoCargandoManual',
  render: () => <EstadoCargandoTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
  tags: ['!autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Estado manual: rellenar campos y hacer submit para ver el botón "Lanzando…". No reproducible automáticamente sin mock del action.',
      },
    },
  },
}

export const ConDatosRellenos: Story = {
  render: () => <ConDatosRellenosTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
}

/**
 * ErrorServidor — submit con respuesta 500 del servidor.
 * La play function rellena los campos requeridos y hace submit. El servidor action
 * devuelve { success: false, error: 'Error interno del servidor' }, lo que provoca
 * que el mensaje de error global aparezca bajo el formulario (role="alert").
 *
 * Nota: en este entorno de Storybook la acción real falla por falta de sesión/DB,
 * por lo que el error de servidor se muestra igualmente bajo el formulario.
 */
export const ErrorServidor: Story = {
  render: () => <ErrorServidorTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup()
    await rellenarCamposRequeridos(canvas, user)
    await user.click(canvas.getByRole('button', { name: '+ Lanzar proyecto' }))
  },
  parameters: {
    docs: {
      description: {
        story:
          'Submit con todos los campos válidos. En el entorno Storybook (sin sesión activa), el servidor action devuelve un error, lo que muestra el mensaje de error global bajo el formulario.',
      },
    },
  },
}

/**
 * ConTodasLasImagenes — uploader con el límite de 3 imágenes alcanzado.
 * El botón "Añadir" desaparece cuando images.length >= maxImages (3).
 * Interactúa manualmente con el uploader para llegar al estado de límite.
 */
// No es posible pre-popular 3 imágenes programáticamente (el ImageUploader
// requiere interacción real con el file input). Excluida de autodocs.
export const ConTodasLasImagenes: Story = {
  render: () => <ConTodasLasImagenesTemplate />,
  args: {
    open: true,
    onOpenChange: () => {},
    communitySlug: 'startup-madrid',
  },
  tags: ['!autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Modal con el ImageUploader en estado de límite alcanzado (MAX_MODAL_IMAGES = 3). El botón "Añadir" queda oculto. Sube 3 imágenes manualmente para reproducir este estado.',
      },
    },
  },
}
