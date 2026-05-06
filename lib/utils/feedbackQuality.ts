/**
 * Story 11.3 — Calidad del feedback
 *
 * Función pura para calcular el quality score de un feedback a partir de sus
 * respuestas de texto. El score es un proxy de completitud basado en la
 * longitud total de los textos: más texto → mayor score.
 *
 * Fórmula: score = min(1.0, totalChars / TARGET_CHARS)
 */

/** Número mínimo de caracteres para alcanzar un quality score de 1.0 */
export const TARGET_CHARS = 200

/**
 * Calcula el quality score de un feedback basándose en la longitud total
 * de todas las respuestas de texto.
 *
 * @param textResponses - Objeto con las respuestas de texto del Reviewer
 * @returns Número entre 0.0 y 1.0 (inclusive en ambos extremos)
 */
export function calculateQualityScore(
  textResponses: Record<string, string>
): number {
  const totalChars = Object.values(textResponses).reduce(
    (sum, text) => sum + text.length,
    0
  )

  return Math.min(1.0, totalChars / TARGET_CHARS)
}
