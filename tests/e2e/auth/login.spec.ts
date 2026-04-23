import { test, expect } from '@playwright/test'

/**
 * Tests E2E para la pantalla /login (Magic Link Authentication)
 *
 * NOTA: Estos tests requieren que el servidor esté corriendo en localhost:3000.
 * No verifican la recepción real del email — solo el UI state.
 * Ejecutar con: npm run test:e2e (con el servidor ya arriba)
 */
test.describe('Login page — Magic Link', () => {
  // Limpiar auth cookies: la página /login redirige a /communities si hay sesión activa
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('muestra el formulario de login en /login', async ({ page }) => {
    await page.goto('/login')

    // Verificar que existe el campo email
    const emailInput = page.getByLabel('Tu email de trabajo')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')

    // Verificar que existe el botón Continuar
    const submitButton = page.getByRole('button', { name: 'Continuar' })
    await expect(submitButton).toBeVisible()
  })

  test('muestra error de validación con email inválido', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel('Tu email de trabajo')
    await emailInput.fill('notanemail')

    const submitButton = page.getByRole('button', { name: 'Continuar' })
    await submitButton.click()

    // Verificar que aparece el mensaje de error inline
    await expect(page.getByText('Introduce un email válido')).toBeVisible()
  })

  test('muestra success state al enviar email válido', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel('Tu email de trabajo')
    await emailInput.fill('test@example.com')

    const submitButton = page.getByRole('button', { name: 'Continuar' })
    await submitButton.click()

    // Verificar que aparece el success state
    // (El server action puede fallar por falta de Supabase real, pero el UI state debe mostrarse
    //  si el mock responde bien — en CI esto requiere mock de Supabase)
    // En local con Supabase configurado: se muestra "Revisa tu email"
    await expect(
      page.getByText('Revisa tu email — te hemos enviado un link de acceso')
    ).toBeVisible({ timeout: 10000 })
  })

  test('muestra CTA solicitar nuevo link cuando error=link-invalid', async ({ page }) => {
    await page.goto('/login?error=link-invalid')

    await expect(page.getByText('El link ha expirado o no es válido.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Solicitar un nuevo link' })).toBeVisible()
  })
})
