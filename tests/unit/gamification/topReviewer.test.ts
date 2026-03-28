/**
 * Tests unitarios — Story 6.2: Feedback Counter & Top Reviewer Widget
 * Validan la función pura calculateTopReviewer y getWeekStart sin dependencias externas.
 */

import { describe, it, expect } from 'vitest'
import { calculateTopReviewer, getWeekStart, type FeedbackRow } from '@/lib/utils/gamification'

// Helper para crear un feedback row
function fb(reviewerId: string, createdAt: string): FeedbackRow {
  return { reviewer_id: reviewerId, created_at: createdAt }
}

describe('calculateTopReviewer — lógica de top reviewer', () => {
  // Test 1: sin feedbacks → null
  it('retorna null con array vacío', () => {
    expect(calculateTopReviewer([])).toBeNull()
  })

  // Test 2: un solo reviewer → devuelve ese reviewer
  it('retorna el único reviewer cuando hay uno solo', () => {
    const feedbacks = [
      fb('user-1', '2026-03-24T10:00:00Z'),
      fb('user-1', '2026-03-24T11:00:00Z'),
    ]
    const result = calculateTopReviewer(feedbacks)
    expect(result).not.toBeNull()
    expect(result!.userId).toBe('user-1')
    expect(result!.feedbackCount).toBe(2)
  })

  // Test 3: reviewer con más feedbacks gana
  it('devuelve el reviewer con más feedbacks', () => {
    const feedbacks = [
      fb('user-1', '2026-03-24T10:00:00Z'),
      fb('user-2', '2026-03-24T10:01:00Z'),
      fb('user-2', '2026-03-24T10:02:00Z'),
      fb('user-2', '2026-03-24T10:03:00Z'),
      fb('user-1', '2026-03-24T10:04:00Z'),
    ]
    const result = calculateTopReviewer(feedbacks)
    expect(result!.userId).toBe('user-2')
    expect(result!.feedbackCount).toBe(3)
  })

  // Test 4: empate — gana el que llegó primero (menor created_at del primer feedback)
  it('en empate, devuelve el reviewer que llegó primero', () => {
    const feedbacks = [
      fb('user-2', '2026-03-24T10:00:01Z'), // user-2 llega primero pero un segundo más tarde
      fb('user-1', '2026-03-24T10:00:00Z'), // user-1 llega 1s antes
      fb('user-2', '2026-03-24T10:05:00Z'),
      fb('user-1', '2026-03-24T10:06:00Z'),
    ]
    // Ambos tienen 2 feedbacks. user-1 tiene firstAt '2026-03-24T10:00:00Z' < user-2 '2026-03-24T10:00:01Z'
    const result = calculateTopReviewer(feedbacks)
    expect(result!.userId).toBe('user-1')
    expect(result!.feedbackCount).toBe(2)
  })

  // Test 5: tres reviewers, el segundo gana
  it('funciona correctamente con múltiples reviewers', () => {
    const feedbacks = [
      fb('user-1', '2026-03-24T09:00:00Z'),
      fb('user-3', '2026-03-24T09:30:00Z'),
      fb('user-2', '2026-03-24T10:00:00Z'),
      fb('user-2', '2026-03-24T10:01:00Z'),
      fb('user-2', '2026-03-24T10:02:00Z'),
      fb('user-1', '2026-03-24T10:03:00Z'),
    ]
    // user-2: 3, user-1: 2, user-3: 1
    const result = calculateTopReviewer(feedbacks)
    expect(result!.userId).toBe('user-2')
    expect(result!.feedbackCount).toBe(3)
  })
})

describe('getWeekStart — cálculo del inicio de semana (lunes UTC)', () => {
  // Test 6: miércoles → lunes de la misma semana
  it('desde un miércoles, retorna el lunes de la misma semana', () => {
    // 2026-03-25 es miércoles
    const wednesday = new Date('2026-03-25T14:30:00Z')
    const weekStart = getWeekStart(wednesday)
    expect(weekStart.getUTCDay()).toBe(1) // lunes
    expect(weekStart.getUTCDate()).toBe(23) // 23 de marzo
    expect(weekStart.getUTCHours()).toBe(0)
    expect(weekStart.getUTCMinutes()).toBe(0)
    expect(weekStart.getUTCSeconds()).toBe(0)
  })

  // Test 7: domingo → lunes anterior (6 días atrás)
  it('desde un domingo, retorna el lunes anterior (6 días antes)', () => {
    // 2026-03-29 es domingo
    const sunday = new Date('2026-03-29T10:00:00Z')
    const weekStart = getWeekStart(sunday)
    expect(weekStart.getUTCDay()).toBe(1) // lunes
    expect(weekStart.getUTCDate()).toBe(23) // 23 de marzo
  })

  // Test 8: lunes → el mismo día a las 00:00:00
  it('desde un lunes, retorna ese mismo lunes a las 00:00:00 UTC', () => {
    // 2026-03-23 es lunes
    const monday = new Date('2026-03-23T20:00:00Z')
    const weekStart = getWeekStart(monday)
    expect(weekStart.getUTCDay()).toBe(1) // lunes
    expect(weekStart.getUTCDate()).toBe(23)
    expect(weekStart.getUTCHours()).toBe(0)
  })
})
