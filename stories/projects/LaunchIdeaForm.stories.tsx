import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fn } from 'storybook/test'
import { LaunchIdeaForm } from '@/components/projects/LaunchIdeaForm'
import { launchIdeaSchema, type LaunchIdeaFormValues } from '@/lib/validations/projects'
import type { UploaderImage } from '@/components/projects/ImageUploader'

const meta = {
  title: 'Projects/LaunchIdeaForm',
  component: LaunchIdeaForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof LaunchIdeaForm>

export default meta
type Story = StoryObj<typeof meta>

// ── Wrapper ────────────────────────────────────────────────────────────────────
// LaunchIdeaForm usa useFormContext — necesita un FormProvider padre.

interface WrapperProps {
  defaultValues?: Partial<LaunchIdeaFormValues>
  feedbackTopics?: string[]
  images?: UploaderImage[]
}

function FormWrapper({ defaultValues = {}, feedbackTopics: initialTopics = [], images: initialImages = [] }: WrapperProps) {
  const [feedbackTopics, setFeedbackTopics] = useState<string[]>(initialTopics)
  const [images, setImages] = useState<UploaderImage[]>(initialImages)

  const methods = useForm<LaunchIdeaFormValues>({
    resolver: zodResolver(launchIdeaSchema),
    defaultValues: {
      title: '',
      tagline: '',
      problem: '',
      solution: '',
      targetUser: '',
      hypothesis: '',
      demoLink: '',
      ...defaultValues,
    },
  })

  return (
    <FormProvider {...methods}>
      <form noValidate style={{ maxWidth: '640px' }}>
        <LaunchIdeaForm
          feedbackTopics={feedbackTopics}
          onFeedbackTopicsChange={setFeedbackTopics}
          images={images}
          onImagesChange={setImages}
        />
      </form>
    </FormProvider>
  )
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * FormularioVacio — todos los campos en blanco, estado inicial.
 */
export const FormularioVacio: Story = {
  render: () => <FormWrapper />,
  args: {
    feedbackTopics: [],
    onFeedbackTopicsChange: fn(),
    images: [],
    onImagesChange: fn(),
  },
}

/**
 * ConDatos — formulario con todos los campos pre-rellenados.
 */
export const ConDatos: Story = {
  render: () => (
    <FormWrapper
      defaultValues={{
        title: 'Pulse Check',
        tagline: 'Anonymous weekly mood tracking for distributed teams',
        problem: 'Remote teams struggle to surface burnout and morale issues before they escalate.',
        solution: 'A lightweight weekly pulse survey with trend visualization for team leads.',
        targetUser: 'Engineering managers with 5+ remote reports',
        hypothesis: 'If team leads see mood trends weekly, they will intervene 2x faster on morale dips.',
        demoLink: 'https://example.com/pulse-demo',
      }}
      feedbackTopics={['Problem clarity', 'Willingness to use', 'Missing features']}
    />
  ),
  args: {
    feedbackTopics: ['Problem clarity', 'Willingness to use', 'Missing features'],
    onFeedbackTopicsChange: fn(),
    images: [],
    onImagesChange: fn(),
  },
}

/**
 * Enviando — simula el estado de envío en curso.
 * La play function hace submit sin rellenar campos para disparar
 * la validación y mostrar los errores de los campos requeridos.
 */
export const ConErroresValidacion: Story = {
  render: () => <FormWrapper />,
  args: {
    feedbackTopics: [],
    onFeedbackTopicsChange: fn(),
    images: [],
    onImagesChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    const user = userEvent.setup()

    // Escribir y borrar el campo título para disparar el error de validación
    const titleInput = canvas.getByTestId('modal-field-title')
    await user.type(titleInput, 'x')
    await user.clear(titleInput)
    await user.tab()

    // Disparar el campo tagline también
    const taglineInput = canvas.getByTestId('modal-field-tagline')
    await user.type(taglineInput, 'x')
    await user.clear(taglineInput)
    await user.tab()
  },
  parameters: {
    docs: {
      description: {
        story:
          'La play function escribe y borra valores en los campos requeridos para disparar la validación y mostrar los mensajes de error inline.',
      },
    },
  },
}
