import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()
for (const dir of ['.next', 'out', '.vercel_static']) {
  rmSync(resolve(cwd, dir), { recursive: true, force: true })
}
