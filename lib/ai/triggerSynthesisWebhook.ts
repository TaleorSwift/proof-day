// Story 12.7 — Trigger fire-and-forget del webhook de síntesis IA
// Llamado desde POST /api/feedback cuando se alcanzan 3 feedbacks completos.
// NO es async. NO usa await. Retorna void inmediatamente.

import { isAIEnabled } from '@/lib/ai/featureFlag'

/**
 * Dispara el webhook de síntesis IA de forma asíncrona (fire-and-forget).
 * No bloquea la respuesta del endpoint que lo llama.
 * Los errores de red se registran en consola pero no se propagan.
 */
export function triggerSynthesisWebhook(projectId: string): void {
  if (!isAIEnabled()) return
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/ai-synthesis`
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': process.env.WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify({ projectId }),
  }).catch((err: unknown) => {
    console.error('[triggerSynthesisWebhook] fetch failed:', err)
  })
}
