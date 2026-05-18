// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { FeedbackQuestion } from '@/components/feedback/FeedbackQuestion'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BASE_PROPS = {
  number: 1 as const,
  question: '¿Entiendes claramente el problema planteado?',
  tooltip: 'Evalúa si el problema está bien explicado.',
  textValue: '',
  onTextChange: vi.fn(),
}

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — renderizado de leyenda
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — leyenda con número y texto', () => {
  it('muestra el prefijo P1 seguido del texto de la pregunta', () => {
    render(<FeedbackQuestion {...BASE_PROPS} />)
    expect(screen.getByText(/P1\./)).toBeInTheDocument()
    expect(screen.getByText(/¿Entiendes claramente el problema planteado\?/)).toBeInTheDocument()
  })

  it('muestra el botón de tooltip con aria-label adecuado', () => {
    render(<FeedbackQuestion {...BASE_PROPS} />)
    expect(
      screen.getByRole('button', { name: 'Más info sobre la pregunta 1' })
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — modo con score (P1-P3)
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — ToggleGroup en modo score', () => {
  // Los ToggleGroupItem de Radix usan role="radio" dentro del grupo
  it('renderiza las tres opciones Sí, Más o menos, No cuando no es isTextOnly', () => {
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        onScoreChange={vi.fn()}
      />
    )
    expect(screen.getByRole('radio', { name: 'Sí' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Más o menos' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No' })).toBeInTheDocument()
  })

  it('no renderiza el ToggleGroup cuando isTextOnly es true', () => {
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        isTextOnly
      />
    )
    expect(screen.queryByRole('radio', { name: 'Sí' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Más o menos' })).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'No' })).not.toBeInTheDocument()
  })

  it('no renderiza el ToggleGroup cuando onScoreChange no se pasa', () => {
    render(<FeedbackQuestion {...BASE_PROPS} />)
    expect(screen.queryByRole('radio', { name: 'Sí' })).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — selección de score
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — selección de score', () => {
  it('llama a onScoreChange con 3 al hacer click en "Sí"', () => {
    const onScoreChange = vi.fn()
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        onScoreChange={onScoreChange}
      />
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Sí' }))
    expect(onScoreChange).toHaveBeenCalledWith(3)
  })

  it('llama a onScoreChange con 2 al hacer click en "Más o menos"', () => {
    const onScoreChange = vi.fn()
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        onScoreChange={onScoreChange}
      />
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Más o menos' }))
    expect(onScoreChange).toHaveBeenCalledWith(2)
  })

  it('llama a onScoreChange con 1 al hacer click en "No"', () => {
    const onScoreChange = vi.fn()
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        onScoreChange={onScoreChange}
      />
    )
    fireEvent.click(screen.getByRole('radio', { name: 'No' }))
    expect(onScoreChange).toHaveBeenCalledWith(1)
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — textarea
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — textarea', () => {
  it('renderiza el textarea con aria-label correcto', () => {
    render(<FeedbackQuestion {...BASE_PROPS} />)
    expect(
      screen.getByRole('textbox', { name: 'Respuesta de texto para pregunta 1' })
    ).toBeInTheDocument()
  })

  it('muestra placeholder "Comentario adicional (opcional)..." cuando textOptional es true', () => {
    render(<FeedbackQuestion {...BASE_PROPS} textOptional />)
    expect(
      screen.getByPlaceholderText('Comentario adicional (opcional)...')
    ).toBeInTheDocument()
  })

  it('muestra placeholder "Mínimo 10 caracteres..." cuando isTextOnly es true', () => {
    render(<FeedbackQuestion {...BASE_PROPS} isTextOnly />)
    expect(screen.getByPlaceholderText('Mínimo 10 caracteres...')).toBeInTheDocument()
  })

  it('llama a onTextChange con el valor introducido', () => {
    const onTextChange = vi.fn()
    render(<FeedbackQuestion {...BASE_PROPS} onTextChange={onTextChange} />)
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Respuesta de texto para pregunta 1' }),
      { target: { value: 'Mi comentario' } }
    )
    expect(onTextChange).toHaveBeenCalledWith('Mi comentario')
  })

  it('muestra el valor actual del textarea', () => {
    render(<FeedbackQuestion {...BASE_PROPS} textValue="Texto previo" />)
    expect(
      screen.getByRole('textbox', { name: 'Respuesta de texto para pregunta 1' })
    ).toHaveValue('Texto previo')
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — alerta de longitud mínima en isTextOnly
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — alerta de mínimo de caracteres', () => {
  it('no muestra alerta cuando textValue está vacío', () => {
    render(<FeedbackQuestion {...BASE_PROPS} isTextOnly textValue="" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('muestra alerta cuando textValue tiene menos de 10 caracteres', () => {
    render(<FeedbackQuestion {...BASE_PROPS} isTextOnly textValue="corto" />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escribe al menos 10 caracteres en tu respuesta'
    )
  })

  it('no muestra alerta cuando textValue tiene exactamente 10 caracteres', () => {
    render(<FeedbackQuestion {...BASE_PROPS} isTextOnly textValue="1234567890" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('no muestra alerta cuando textValue supera 10 caracteres', () => {
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        isTextOnly
        textValue="Texto suficientemente largo"
      />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('no muestra alerta en modo score aunque textValue sea corto', () => {
    render(
      <FeedbackQuestion
        {...BASE_PROPS}
        onScoreChange={vi.fn()}
        textOptional
        textValue="corto"
      />
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackQuestion — distintos números de pregunta
// ---------------------------------------------------------------------------

describe('FeedbackQuestion — número de pregunta 4', () => {
  it('muestra "P4." en la leyenda', () => {
    render(
      <FeedbackQuestion
        number={4}
        question="¿Qué mejorarías de esta propuesta?"
        tooltip="Comparte qué cambiarías."
        textValue=""
        onTextChange={vi.fn()}
        isTextOnly
      />
    )
    expect(screen.getByText(/P4\./)).toBeInTheDocument()
  })

  it('el textarea tiene rows=4 en modo isTextOnly', () => {
    render(
      <FeedbackQuestion
        number={4}
        question="¿Qué mejorarías?"
        tooltip="Tooltip"
        textValue=""
        onTextChange={vi.fn()}
        isTextOnly
      />
    )
    const textarea = screen.getByRole('textbox', {
      name: 'Respuesta de texto para pregunta 4',
    })
    expect(textarea).toHaveAttribute('rows', '4')
  })
})
