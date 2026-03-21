import { config } from 'dotenv'
import { join } from 'path'
import { defineConfig } from 'vitest/config'

config({ path: join(__dirname, '.env.local') })
config({ path: join(__dirname, '.env') })
config({ path: join(__dirname, '.env.test') })

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    globalSetup: ['./tests/integration/global-setup.ts'],
    setupFiles: ['./tests/integration/setup-integration.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      '@': join(__dirname, './'),
    },
  },
})
