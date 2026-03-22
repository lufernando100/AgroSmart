#!/usr/bin/env node
/**
 * Replica el workflow .github/workflows/ci.yml en una sola secuencia:
 * eslint → typecheck → vitest → next build → playwright (con CI=true).
 * Usa los mismos placeholders de Supabase que el job de GitHub Actions.
 */
import { spawnSync } from 'node:child_process'

const SUPABASE_CI = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://ci-placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
}

function run(label, command, args, extraEnv = {}) {
  console.log(`\n━━ ${label} ━━\n`)
  const env = { ...process.env, ...SUPABASE_CI, ...extraEnv }
  const r = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env,
  })
  if (r.status !== 0 && r.status !== null) {
    process.exit(r.status)
  }
  if (r.error) {
    console.error(r.error)
    process.exit(1)
  }
}

run('ESLint', 'npx', ['eslint', '.', '--max-warnings', '0'])
run('TypeScript', 'npm', ['run', 'typecheck'])
run('Vitest', 'npm', ['run', 'test'])
run('Next.js build', 'npm', ['run', 'build'])
run('Playwright E2E', 'npm', ['run', 'test:e2e'], { CI: 'true' })

console.log('\n━━ CI local: todo OK (paridad con GitHub Actions) ━━\n')
