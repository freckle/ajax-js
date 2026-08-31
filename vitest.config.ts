import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // jsdom, not node: these helpers reach for XMLHttpRequest, document, window
    // and the global jQuery `$` that consumers install.
    environment: 'jsdom',
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Without this, v8 only reports files a test imported, so an untested
      // module would silently not count against the thresholds below.
      include: ['src/**/*.ts'],
      // Remove to stop enforcing coverage (also revert ci.yml's pnpm coverage -> pnpm test)
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70
      }
    }
  }
})
