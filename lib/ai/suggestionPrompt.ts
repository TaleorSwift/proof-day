export type SuggestField = 'problem' | 'solution' | 'hypothesis'

export interface SuggestContext {
  title: string
  problem?: string
  solution?: string
  hypothesis?: string
  templateId?: string
}

export function buildSuggestionPrompt(field: SuggestField, context: SuggestContext): string {
  const base = `Eres un asistente que ayuda a emprendedores a describir sus proyectos de forma clara y concisa. El proyecto se llama "${context.title}".`

  if (field === 'problem') {
    return `${base} Escribe un párrafo breve (2-3 frases) describiendo el problema que este proyecto resuelve. Sé específico y orientado al usuario afectado. Responde SOLO con el párrafo, sin explicaciones adicionales.`
  }

  if (field === 'solution') {
    const problemCtx = context.problem ? ` El problema que resuelve es: "${context.problem}".` : ''
    return `${base}${problemCtx} Escribe un párrafo breve (2-3 frases) describiendo la solución propuesta. Sé concreto y describe el producto/servicio. Responde SOLO con el párrafo, sin explicaciones adicionales.`
  }

  // field === 'hypothesis'
  const ctx = [
    context.problem ? `Problema: "${context.problem}"` : '',
    context.solution ? `Solución: "${context.solution}"` : '',
  ].filter(Boolean).join('. ')

  return `${base}${ctx ? ' ' + ctx : ''} Escribe una hipótesis de validación para este proyecto en formato "Creemos que [acción] logrará [resultado] para [usuario]. Lo validaremos cuando [métrica]." Una sola oración. Responde SOLO con la hipótesis, sin explicaciones adicionales.`
}
