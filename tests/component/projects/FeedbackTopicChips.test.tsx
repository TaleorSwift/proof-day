// @vitest-environment jsdom
/**
 * Tests — FeedbackTopicChips (Story 9.8)
 * AC-3: chips toggleables, aria-pressed, selección múltiple.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { FeedbackTopicChips } from '@/components/projects/FeedbackTopicChips'

const ALL_CHIPS = [
  'Claridad del problema',
  'Disposición de uso',
  'Viabilidad técnica',
  'Funcionalidades faltantes',
  'Ajuste de mercado',
  'Problemas de UX',
]

describe('FeedbackTopicChips — render', () => {
  it('renderiza el contenedor con data-testid="modal-feedback-chips"', () => {
    render(<FeedbackTopicChips value={[]} onChange={vi.fn()} />)
    expect(screen.getByTestId('modal-feedback-chips')).toBeInTheDocument()
  })

  it('renderiza los 6 chips disponibles', () => {
    render(<FeedbackTopicChips value={[]} onChange={vi.fn()} />)
    ALL_CHIPS.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
})

describe('FeedbackTopicChips — AC-3: estado aria-pressed', () => {
  it('chip inactivo tiene aria-pressed="false"', () => {
    render(<FeedbackTopicChips value={[]} onChange={vi.fn()} />)
    const chip = screen.getByText('Claridad del problema').closest('button')
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('chip activo tiene aria-pressed="true"', () => {
    render(
      <FeedbackTopicChips
        value={['problem_clarity']}
        onChange={vi.fn()}
      />
    )
    const chip = screen.getByText('Claridad del problema').closest('button')
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('FeedbackTopicChips — AC-3: toggle', () => {
  it('al hacer clic en chip inactivo, llama onChange con el valor añadido', () => {
    const onChange = vi.fn()
    render(<FeedbackTopicChips value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Claridad del problema'))
    expect(onChange).toHaveBeenCalledWith(['problem_clarity'])
  })

  it('al hacer clic en chip activo, llama onChange con el valor eliminado', () => {
    const onChange = vi.fn()
    render(
      <FeedbackTopicChips
        value={['problem_clarity', 'market_fit']}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByText('Claridad del problema'))
    expect(onChange).toHaveBeenCalledWith(['market_fit'])
  })

  it('permite seleccionar múltiples chips simultáneamente', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <FeedbackTopicChips value={[]} onChange={onChange} />
    )
    fireEvent.click(screen.getByText('Claridad del problema'))
    expect(onChange).toHaveBeenLastCalledWith(['problem_clarity'])

    rerender(
      <FeedbackTopicChips
        value={['problem_clarity']}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByText('Viabilidad técnica'))
    expect(onChange).toHaveBeenLastCalledWith([
      'problem_clarity',
      'technical_feasibility',
    ])
  })
})

describe('FeedbackTopicChips — mapeo display/valor', () => {
  it.each([
    ['Claridad del problema', 'problem_clarity'],
    ['Disposición de uso', 'willingness_to_use'],
    ['Viabilidad técnica', 'technical_feasibility'],
    ['Funcionalidades faltantes', 'missing_features'],
    ['Ajuste de mercado', 'market_fit'],
    ['Problemas de UX', 'ux_concerns'],
  ])('chip "%s" produce valor interno "%s"', (label, internalValue) => {
    const onChange = vi.fn()
    render(<FeedbackTopicChips value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText(label))
    expect(onChange).toHaveBeenCalledWith([internalValue])
  })
})
