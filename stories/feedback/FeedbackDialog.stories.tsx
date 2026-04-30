import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog'

const meta = {
  title: 'Feedback/FeedbackDialog',
  component: FeedbackDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    projectId: 'project-demo-123',
    communityId: 'community-demo-abc',
    isOpen: true,
    onClose: fn(),
    onSuccess: fn(),
  },
} satisfies Meta<typeof FeedbackDialog>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: Diálogo abierto — estado vacío inicial
// ---------------------------------------------------------------------------

export const Abierto: Story = {
  name: 'Abierto — estado vacío inicial',
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'El diálogo está abierto con todos los campos vacíos. El botón "Enviar feedback" aparece deshabilitado hasta que se rellenen las tres preguntas de puntuación (P1-P3) y el campo de texto P4 tenga al menos 10 caracteres.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Diálogo cerrado — el componente no renderiza nada
// ---------------------------------------------------------------------------

export const Cerrado: Story = {
  name: 'Cerrado — el diálogo no es visible',
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Cuando `isOpen` es false, Radix Dialog no renderiza el contenido del diálogo. El canvas aparece vacío — ese es el comportamiento correcto.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Estado de envío en curso (loading)
// — se simula mediante render personalizado con estado interno congelado
// ---------------------------------------------------------------------------

export const Enviando: Story = {
  name: 'Enviando — botón deshabilitado con texto "Enviando..."',
  parameters: {
    docs: {
      description: {
        story:
          'Durante el envío, el botón muestra "Enviando..." y está deshabilitado. Este estado se activa internamente cuando `handleSubmit` realiza la llamada a la API. Para reproducirlo en Storybook, usa `msw` o un mock de fetch que tarde varios segundos antes de resolver.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: Error al enviar feedback
// ---------------------------------------------------------------------------

export const ConError: Story = {
  name: 'Con error — mensaje de error visible',
  parameters: {
    docs: {
      description: {
        story:
          'Cuando `submitFeedback` lanza un error, el componente muestra el mensaje de error en un bloque de alerta inline por encima del botón de envío. Para simular este estado en Storybook, añade un mock de fetch que rechace la petición.',
      },
    },
  },
}
