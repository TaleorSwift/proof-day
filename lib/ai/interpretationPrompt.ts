import type { ProofScoreLabel } from '@/lib/types/proof-score'

export interface InterpretationPromptParams {
  title: string
  problem: string
  scoreLabel: ProofScoreLabel
  average: number
  feedbackCount: number
}

export function buildInterpretationPrompt(params: InterpretationPromptParams): string {
  const { title, problem, scoreLabel, average, feedbackCount } = params
  const pct = Math.round(((average - 1) / 2) * 100)

  return `Eres un analista de producto que ayuda a emprendedores a interpretar los resultados de validación de su proyecto.

El proyecto "${title}" tiene el siguiente resultado de validación:
- Puntuación: ${pct}/100 (${feedbackCount} feedbacks recibidos)
- Estado: ${scoreLabel}
- Problema que resuelve: ${problem}

Escribe una interpretación breve (2-4 frases) en español que:
1. Explique qué significa este resultado en términos prácticos para el emprendedor
2. Sugiera 1 acción concreta que el emprendedor podría tomar como siguiente paso
3. Sea directa, útil y sin tecnicismos

Solo el texto de la interpretación, sin título ni bullet points.`
}
