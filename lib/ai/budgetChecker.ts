// Story 12.2 — Verificación de presupuesto diario de IA
// AC4: Ollama local = sin coste económico → siempre retorna true
// AI_DAILY_BUDGET_USD se mantiene en config para compatibilidad futura con APIs de pago

/**
 * Verifica si el presupuesto diario de IA permite ejecutar una síntesis.
 * Para Ollama local el coste es 0.0 — siempre retorna true.
 * La variable AI_DAILY_BUDGET_USD se mantiene disponible para futuras integraciones
 * con APIs de pago (Anthropic, OpenAI, etc.).
 */
export async function checkDailyBudget(
  // communityId reservado para futura lógica por comunidad
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _communityId: string
): Promise<boolean> {
  // Ollama corre localmente — sin coste económico real.
  // Sin límite de presupuesto aplicable.
  return true
}
