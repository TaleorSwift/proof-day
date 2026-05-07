// Story 11.5 — Helpers para gate de reciprocidad al publicar

export interface ReciprocityGate {
  blocked: boolean
  given: number
  required: number
}

/**
 * Construye el mensaje de error del gate de reciprocidad con pluralización correcta.
 * AC-4: singular ("1 feedback") vs plural ("N feedbacks") según los que faltan.
 */
export function buildReciprocityMessage(given: number, required: number): string {
  const missing = required - given
  const feedbackWord = missing === 1 ? 'feedback' : 'feedbacks'
  return `Necesitas dar ${missing} ${feedbackWord} más antes de publicar. Has dado ${given} de ${required} requeridos.`
}

/**
 * Evalúa si el gate de reciprocidad está bloqueado.
 * Devuelve un ReciprocityGate con el estado y los conteos.
 */
export function checkReciprocityGate(given: number, required: number): ReciprocityGate {
  return {
    blocked: required > 0 && given < required,
    given,
    required,
  }
}
