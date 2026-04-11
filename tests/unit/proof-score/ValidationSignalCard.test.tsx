// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ValidationSignalCard } from '@/components/proof-score/ValidationSignalCard'

// ---------------------------------------------------------------------------
// Suite: dos barras de progreso separadas
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — barras de progreso', () => {
  it('renderiza la barra "Comprenden el problema" con el porcentaje correcto', () => {
    render(<ValidationSignalCard understandPercent={70} wouldUsePercent={45} feedbackCount={5} />)
    const bar = screen.getByRole('progressbar', { name: 'Comprenden el problema' })
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveAttribute('aria-valuenow', '70')
  })

  it('renderiza la barra "Lo usarían" con el porcentaje correcto', () => {
    render(<ValidationSignalCard understandPercent={70} wouldUsePercent={45} feedbackCount={5} />)
    const bar = screen.getByRole('progressbar', { name: 'Lo usarían' })
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveAttribute('aria-valuenow', '45')
  })

  it('muestra "Basado en N feedbacks" con el count interpolado', () => {
    render(<ValidationSignalCard understandPercent={60} wouldUsePercent={40} feedbackCount={8} />)
    expect(screen.getByText('Basado en 8 feedbacks')).toBeInTheDocument()
  })

  it('muestra el disclaimer en itálica', () => {
    render(<ValidationSignalCard understandPercent={60} wouldUsePercent={40} feedbackCount={3} />)
    expect(screen.getByText(/esta señal se actualiza con cada nuevo feedback/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: SignalIndicator — derivación del label
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — SignalIndicator derivado', () => {
  it('muestra "Promising" cuando understandPercent >= 70', () => {
    render(<ValidationSignalCard understandPercent={70} wouldUsePercent={50} feedbackCount={5} />)
    expect(screen.getByText('Promising')).toBeInTheDocument()
  })

  it('muestra "Needs iteration" cuando understandPercent >= 40 y < 70', () => {
    render(<ValidationSignalCard understandPercent={55} wouldUsePercent={30} feedbackCount={4} />)
    expect(screen.getByText('Needs iteration')).toBeInTheDocument()
  })

  it('muestra "Weak" cuando understandPercent < 40', () => {
    render(<ValidationSignalCard understandPercent={20} wouldUsePercent={10} feedbackCount={2} />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: estado sin datos (feedbackCount = 0)
// ---------------------------------------------------------------------------

describe('ValidationSignalCard — estado sin datos', () => {
  it('muestra "Aún no hay datos de validación" cuando feedbackCount es 0', () => {
    render(<ValidationSignalCard understandPercent={0} wouldUsePercent={0} feedbackCount={0} />)
    expect(screen.getByText(/aún no hay datos de validación/i)).toBeInTheDocument()
  })

  it('no muestra barras de progreso cuando feedbackCount es 0', () => {
    render(<ValidationSignalCard understandPercent={0} wouldUsePercent={0} feedbackCount={0} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
