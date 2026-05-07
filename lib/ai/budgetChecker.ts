// Story 12.2 — Verificación de presupuesto diario de IA
// AC4: Ollama local = sin coste económico → siempre retorna true
// AI_DAILY_BUDGET_USD se mantiene en config para compatibilidad futura con APIs de pago
// Story 12.7 — maybeSendBudgetAlert: alerta a admins cuando >= 80% del presupuesto usado

import { createClient } from '@supabase/supabase-js'

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

/**
 * Envía alertas de presupuesto a los admins de una comunidad cuando el coste acumulado
 * alcanza o supera el 80% del límite configurado.
 * Incluye deduplicación diaria: solo se envía una alerta por día.
 * No lanza errores — silencia fallos para no interrumpir el flujo principal.
 */
export async function maybeSendBudgetAlert(
  communityId: string,
  currentCostUsd: number,
  limitUsd: number
): Promise<void> {
  const percentUsed = currentCostUsd / limitUsd
  if (percentUsed < 0.8) return

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Deduplicación diaria: no enviar más de una alerta por día
  const today = new Date().toISOString().split('T')[0]
  const { data: existingAlert } = await supabaseAdmin
    .from('notifications')
    .select('id')
    .eq('type', 'budget_alert')
    .gte('created_at', `${today}T00:00:00Z`)
    .maybeSingle()
  if (existingAlert) return

  // Obtener admins de la comunidad
  const { data: admins } = await supabaseAdmin
    .from('community_members')
    .select('user_id')
    .eq('community_id', communityId)
    .eq('role', 'admin')
  if (!admins?.length) return

  await supabaseAdmin.from('notifications').insert(
    admins.map((admin) => ({
      user_id: admin.user_id,
      type: 'budget_alert',
      payload: { communityId, currentCostUsd, limitUsd, percentUsed },
      read: false,
    }))
  )
}
