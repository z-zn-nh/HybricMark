import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const cwd = process.cwd()
const nextDir = resolve(cwd, '.next')
const outputDir = resolve(cwd, '.vercel_static')

if (!existsSync(nextDir)) {
  throw new Error(`Expected Next.js output at ${nextDir}, but it was not generated.`)
}

rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })
cpSync(nextDir, outputDir, { recursive: true })

console.log('Generated Next output at ./.vercel_static')
