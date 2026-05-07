// Story 12.6 — Template de email "Síntesis IA lista"
// HTML con estilos inline para compatibilidad con clientes de email.

interface AiSynthesisReadyEmailInput {
  projectTitle: string
  projectUrl: string
  summaryText: string
}

interface EmailContent {
  subject: string
  html: string
}

/**
 * Construye el subject y HTML del email de notificación "síntesis de IA lista".
 * Los estilos son inline para máxima compatibilidad con clientes de email.
 */
export function buildAiSynthesisReadyEmail({
  projectTitle,
  projectUrl,
  summaryText,
}: AiSynthesisReadyEmailInput): EmailContent {
  const subject = `Tu síntesis de IA está lista para ${projectTitle}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 32px;">

    <h1 style="font-size: 22px; color: #1A1A18; margin: 0 0 8px 0;">
      Síntesis de IA lista
    </h1>

    <p style="font-size: 16px; color: #4B4B48; margin: 0 0 24px 0;">
      La síntesis de inteligencia artificial de tu proyecto <strong>${projectTitle}</strong> ya está disponible.
    </p>

    <blockquote style="border-left: 4px solid #E5E5E0; margin: 0 0 24px 0; padding: 12px 16px; background-color: #F9F9F7; color: #4B4B48; font-style: italic;">
      ${summaryText}
    </blockquote>

    <a
      href="${projectUrl}"
      style="display: inline-block; background-color: #1A1A18; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;"
    >
      Ver síntesis
    </a>

    <p style="font-size: 13px; color: #9E9E96; margin: 32px 0 0 0;">
      Este email fue enviado automáticamente por Proof Day. Si no esperabas este mensaje, puedes ignorarlo.
    </p>
  </div>
</body>
</html>
`.trim()

  return { subject, html }
}
