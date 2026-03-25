/**
 * Loads KEY=VALUE lines from a file into process.env (later lines override earlier).
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

export function loadEnvFile(relativeOrAbsolutePath) {
  const envPath = relativeOrAbsolutePath.startsWith('/')
    ? relativeOrAbsolutePath
    : resolve(root, relativeOrAbsolutePath)

  if (!existsSync(envPath)) {
    return { ok: false, path: envPath, error: 'file not found' }
  }

  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    const col = trimmed.indexOf(':')
    let sep = -1
    if (eq !== -1 && (col === -1 || eq < col)) sep = eq
    else if (col !== -1) sep = col
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    let val = trimmed.slice(sep + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return { ok: true, path: envPath }
}

export { root }
