import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const AUTH_STATE_PATH = path.join(__dirname, 'tests/e2e/.auth/user.json')
const ADMIN_AUTH_STATE_PATH = path.join(__dirname, 'tests/e2e/.auth/admin.json')
const REVIEWER_AUTH_STATE_PATH = path.join(__dirname, 'tests/e2e/.auth/reviewer.json')
const ISOLATED_AUTH_STATE_PATH = path.join(__dirname, 'tests/e2e/.auth/isolated.json')

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
    // ── Setup: crea usuarios de test y guarda auth states ──────────────────────
    // IMPORTANTE: los patrones grep deben mantenerse sincronizados con los títulos
    // de los tests en tests/e2e/auth.setup.ts. No renombrar esos tests sin actualizar aquí.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      grep: /autenticar usuario de test/,
    },
    {
      name: 'setup-admin',
      testMatch: /auth\.setup\.ts/,
      grep: /autenticar usuario admin/,
    },
    {
      name: 'setup-reviewer',
      testMatch: /auth\.setup\.ts/,
      grep: /autenticar usuario reviewer/,
    },
    {
      name: 'setup-isolated',
      testMatch: /auth\.setup\.ts/,
      grep: /autenticar usuario isolated/,
    },

    // ── Proyecto principal (usuario regular) ───────────────────────────────────
    // Los specs que prueban escenarios sin sesión limpian las cookies en beforeEach
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ['setup'],
      testIgnore: [/\.admin\.spec\.ts$/, /\.reviewer\.spec\.ts$/, /\.isolated\.spec\.ts$/],
    },

    // ── Proyecto admin ─────────────────────────────────────────────────────────
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ADMIN_AUTH_STATE_PATH,
      },
      dependencies: ['setup-admin'],
      testMatch: /\.admin\.spec\.ts$/,
    },

    // ── Proyecto reviewer ──────────────────────────────────────────────────────
    {
      name: 'chromium-reviewer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: REVIEWER_AUTH_STATE_PATH,
      },
      dependencies: ['setup-reviewer'],
      testMatch: /\.reviewer\.spec\.ts$/,
    },

    // ── Proyecto isolated (usuario sin comunidades) ────────────────────────────
    {
      name: 'chromium-isolated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: ISOLATED_AUTH_STATE_PATH,
      },
      dependencies: ['setup-isolated'],
      testMatch: /\.isolated\.spec\.ts$/,
    },
  ],
  // No ejecutar servidor en tests — debe estar corriendo
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
