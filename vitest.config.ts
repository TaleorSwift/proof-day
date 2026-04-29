import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      include: [
        'lib/**',
        'components/**',
        'app/**',
      ],
      exclude: [
        'lib/utils/gamification.ts',
        'lib/fixtures/**',
        'lib/types/**',
        'components/ui/**',
        'app/layout.tsx',
        'app/robots.ts',
        'app/sitemap.ts',
      ],
      reporter: ['text', 'text-summary'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // server-only no existe fuera del runtime de Next.js; en tests lo neutralizamos
      'server-only': path.resolve(__dirname, 'tests/__mocks__/server-only.ts'),
    },
  },
})
