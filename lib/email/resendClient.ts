// Story 12.6 — Singleton del cliente Resend
// Patrón singleton: una sola instancia de Resend por proceso/módulo.

import { Resend } from 'resend'

let instance: Resend | null = null

/**
 * Retorna la instancia singleton de Resend, creándola en la primera llamada.
 * Utiliza RESEND_API_KEY del entorno.
 */
export function getResendClient(): Resend {
  if (!instance) {
    instance = new Resend(process.env.RESEND_API_KEY)
  }
  return instance
}
