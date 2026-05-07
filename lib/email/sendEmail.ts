// Story 12.6 — Función sendEmail
// Wrapper sobre Resend que toma EMAIL_FROM del entorno.

import { getResendClient } from './resendClient'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Envía un email transaccional via Resend.
 * El remitente se toma de la variable de entorno EMAIL_FROM,
 * con fallback a "no-reply@proof-day.com".
 *
 * @throws Si Resend lanza un error, se propaga al llamador.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const resend = getResendClient()
  const from = process.env.EMAIL_FROM ?? 'no-reply@proof-day.com'
  await resend.emails.send({ from, to, subject, html })
}
