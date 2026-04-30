import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { FeedbackQuestion } from '@/components/feedback/FeedbackQuestion'

const meta = {
  title: 'Feedback/FeedbackQuestion',
  component: FeedbackQuestion,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onScoreChange: fn(),
    onTextChange: fn(),
  },
} satisfies Meta<typeof FeedbackQuestion>

export default meta
type Story = StoryObj<typeof meta>

// ---------------------------------------------------------------------------
// Story: P1-P3 — tipo con puntuación, sin selección
// ---------------------------------------------------------------------------

export const ConPuntuacionSinSeleccionar: Story = {
  name: 'P1 — con puntuación, sin respuesta seleccionada',
  args: {
    number: 1,
    question: '¿Entiendes claramente el problema planteado?',
    tooltip: 'Evalúa si el problema está bien explicado y es comprensible.',
    scoreValue: undefined,
    textValue: '',
    textOptional: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pregunta de tipo puntuación (P1-P3) sin ninguna opción seleccionada. Muestra el ToggleGroup con las tres opciones: "Sí", "Más o menos" y "No", junto con un textarea opcional.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P1-P3 — selección "Sí" (score 3)
// ---------------------------------------------------------------------------

export const ConPuntuacionSi: Story = {
  name: 'P2 — selección "Sí" activa',
  args: {
    number: 2,
    question: '¿Usarías esta solución si estuviera disponible?',
    tooltip: 'Evalúa si la solución resuelve un problema real que tú tendrías.',
    scoreValue: 3,
    textValue: 'La usaría en mi flujo de trabajo diario.',
    textOptional: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado con "Sí" (score=3) seleccionado y texto adicional opcional rellenado.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P1-P3 — selección "Más o menos" (score 2)
// ---------------------------------------------------------------------------

export const ConPuntuacionMasOMenos: Story = {
  name: 'P3 — selección "Más o menos" activa',
  args: {
    number: 3,
    question: '¿Te parece viable técnicamente la solución propuesta?',
    tooltip: 'Evalúa si la solución es técnicamente realizable con los recursos disponibles.',
    scoreValue: 2,
    textValue: '',
    textOptional: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado con "Más o menos" (score=2) seleccionado.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P1-P3 — selección "No" (score 1)
// ---------------------------------------------------------------------------

export const ConPuntuacionNo: Story = {
  name: 'P1 — selección "No" activa',
  args: {
    number: 1,
    question: '¿Entiendes claramente el problema planteado?',
    tooltip: 'Evalúa si el problema está bien explicado y es comprensible.',
    scoreValue: 1,
    textValue: 'No queda claro cuál es el problema central.',
    textOptional: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado con "No" (score=1) seleccionado y comentario adicional.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P4 — solo textarea, obligatorio
// ---------------------------------------------------------------------------

export const SoloTextoVacio: Story = {
  name: 'P4 — solo textarea, campo vacío',
  args: {
    number: 4,
    question: '¿Qué mejorarías de esta propuesta?',
    tooltip: 'Comparte qué cambiarías, qué falta, o qué mejorarías.',
    isTextOnly: true,
    textValue: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pregunta de tipo solo texto (P4). No tiene ToggleGroup. El textarea es obligatorio y requiere al menos 10 caracteres.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P4 — texto demasiado corto, muestra alerta de validación
// ---------------------------------------------------------------------------

export const SoloTextoCorto: Story = {
  name: 'P4 — texto corto, alerta de validación visible',
  args: {
    number: 4,
    question: '¿Qué mejorarías de esta propuesta?',
    tooltip: 'Comparte qué cambiarías, qué falta, o qué mejorarías.',
    isTextOnly: true,
    textValue: 'Mejora',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Cuando se han escrito caracteres pero aún son menos de 10, aparece el mensaje de validación "Escribe al menos 10 caracteres en tu respuesta" bajo el textarea.',
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Story: P4 — texto válido (>=10 caracteres)
// ---------------------------------------------------------------------------

export const SoloTextoValido: Story = {
  name: 'P4 — texto válido, sin alerta',
  args: {
    number: 4,
    question: '¿Qué mejorarías de esta propuesta?',
    tooltip: 'Comparte qué cambiarías, qué falta, o qué mejorarías.',
    isTextOnly: true,
    textValue: 'Añadiría integración con herramientas de gestión de proyectos como Jira o Notion.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Con 10 o más caracteres, la alerta desaparece y el campo se considera válido.',
      },
    },
  },
}
