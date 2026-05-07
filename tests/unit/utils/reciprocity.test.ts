// Story 11.5 — Tests TDD Outside-In: helpers de reciprocidad
// T3.2 — buildReciprocityMessage, checkReciprocityGate

import { describe, it, expect } from 'vitest'
import { buildReciprocityMessage, checkReciprocityGate } from '@/lib/utils/reciprocity'

// ── buildReciprocityMessage ──────────────────────────────────────────────────

describe('buildReciprocityMessage — pluralización correcta', () => {
  it('usa "feedback" (singular) cuando falta exactamente 1', () => {
    const msg = buildReciprocityMessage(2, 3)
    expect(msg).toBe('Necesitas dar 1 feedback más antes de publicar. Has dado 2 de 3 requeridos.')
  })

  it('usa "feedbacks" (plural) cuando faltan más de 1', () => {
    const msg = buildReciprocityMessage(1, 3)
    expect(msg).toBe('Necesitas dar 2 feedbacks más antes de publicar. Has dado 1 de 3 requeridos.')
  })

  it('usa "feedbacks" (plural) cuando el builder tiene 0 feedbacks', () => {
    const msg = buildReciprocityMessage(0, 3)
    expect(msg).toBe('Necesitas dar 3 feedbacks más antes de publicar. Has dado 0 de 3 requeridos.')
  })

  it('usa "feedback" (singular) cuando threshold=1 y builder tiene 0', () => {
    const msg = buildReciprocityMessage(0, 1)
    expect(msg).toBe('Necesitas dar 1 feedback más antes de publicar. Has dado 0 de 1 requeridos.')
  })

  it('construye correctamente con required alto y given bajo', () => {
    const msg = buildReciprocityMessage(1, 5)
    expect(msg).toBe('Necesitas dar 4 feedbacks más antes de publicar. Has dado 1 de 5 requeridos.')
  })
})

// ── checkReciprocityGate ─────────────────────────────────────────────────────

describe('checkReciprocityGate — evaluación del estado del gate', () => {
  it('devuelve blocked=false cuando required=0 (gate desactivado)', () => {
    const gate = checkReciprocityGate(0, 0)
    expect(gate.blocked).toBe(false)
    expect(gate.given).toBe(0)
    expect(gate.required).toBe(0)
  })

  it('devuelve blocked=true cuando given < required', () => {
    const gate = checkReciprocityGate(2, 3)
    expect(gate.blocked).toBe(true)
    expect(gate.given).toBe(2)
    expect(gate.required).toBe(3)
  })

  it('devuelve blocked=false cuando given === required', () => {
    const gate = checkReciprocityGate(3, 3)
    expect(gate.blocked).toBe(false)
  })

  it('devuelve blocked=false cuando given > required', () => {
    const gate = checkReciprocityGate(5, 3)
    expect(gate.blocked).toBe(false)
  })
})
