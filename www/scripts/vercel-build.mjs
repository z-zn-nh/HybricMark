import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const cwd = process.cwd()
const outDir = resolve(cwd, 'out')
const outputDir = resolve(cwd, '.vercel_static')

execSync('next build', { stdio: 'inherit' })

if (!existsSync(outDir)) {
  throw new Error(`Expected export output at ${outDir}, but it was not generated.`)
}

rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })
cpSync(outDir, outputDir, { recursive: true })

console.log('Generated static output at ./.vercel_static')
