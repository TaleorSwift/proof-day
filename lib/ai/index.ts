// Story 12.2 — Barrel export de lib/ai/
// Exporta todas las funciones públicas de la capa de IA

export { getOllamaClient } from './ollamaClient'
export type { OllamaClient, OllamaResponse } from './ollamaClient'

export { buildPrompt, parseAIResponse, synthesizeFeedbacks } from './synthesizeFeedbacks'
export type { AISynthesisResult, ParsedAIResponse } from './synthesizeFeedbacks'

export { trackCost } from './costTracker'
export type { TrackCostInput } from './costTracker'

export { checkDailyBudget, maybeSendBudgetAlert } from './budgetChecker'
