/// <reference types="@vitest/coverage-c8" />

import { defineConfig } from 'vitest/config'
import path from 'node:path'
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['e2e/**', 'tests-examples/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/unit',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
