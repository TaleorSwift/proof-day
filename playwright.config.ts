import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const AUTH_STATE_PATH = path.join(__dirname, 'tests/e2e/.auth/user.json')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup: crea usuario de test y guarda auth state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Proyecto principal: usa el auth state guardado por setup
    // Los specs que prueban escenarios sin sesión limpian las cookies en beforeEach
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ['setup'],
    },
  ],
  // No ejecutar servidor en tests — debe estar corriendo
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
