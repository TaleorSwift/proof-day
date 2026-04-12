import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { LaunchIdeaModal } from '@/components/projects/LaunchIdeaModal'

const meta: Meta<typeof LaunchIdeaModal> = {
  title: 'Projects/LaunchIdeaModal',
  component: LaunchIdeaModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
}

export default meta
type Story = StoryObj<typeof LaunchIdeaModal>

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

export const EstadoVacio: Story = {
  render: () => <EstadoVacioTemplate />,
}

export const ChipsSeleccionados: Story = {
  render: () => <ChipsSeleccionadosTemplate />,
}

export const EstadoCargando: Story = {
  render: () => <EstadoCargandoTemplate />,
  parameters: {
    docs: {
      description: {
        story: 'El botón "+ Lanzar proyecto" muestra "Lanzando..." durante el submit.',
      },
    },
  },
}

export const ConDatosRellenos: Story = {
  render: () => <ConDatosRellenosTemplate />,
}
