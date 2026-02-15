import { existsSync, lstatSync, rmSync, symlinkSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()

for (const dir of ['.next', '.vercel_static']) {
  rmSync(resolve(cwd, dir), { recursive: true, force: true })
}

// Vercel with Root Directory = "www" installs dependencies into /www/node_modules.
// Our docs import local source from ../src, so module resolution may also look for /node_modules.
// Create a lightweight link when root node_modules does not exist.
const workspaceRoot = resolve(cwd, '..')
const workspaceNodeModules = resolve(workspaceRoot, 'node_modules')
const docsNodeModules = resolve(cwd, 'node_modules')

if (existsSync(docsNodeModules) && !existsSync(workspaceNodeModules)) {
  try {
    symlinkSync(
      docsNodeModules,
      workspaceNodeModules,
      process.platform === 'win32' ? 'junction' : 'dir',
    )
  } catch {
    // Ignore linking failures; build may still succeed depending on resolver behavior.
  }
} else if (existsSync(workspaceNodeModules)) {
  try {
    const stats = lstatSync(workspaceNodeModules)
    if (stats.isSymbolicLink()) {
      // no-op; link already present
    }
  } catch {
    // no-op
  }
}
