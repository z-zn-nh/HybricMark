import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

const root = process.cwd()
const wwwDir = resolve(root, 'www')
const outDir = resolve(wwwDir, 'out')
const staticOutputDir = resolve(root, '.vercel_static')

execSync('npm --prefix www install', { stdio: 'inherit' })
execSync('npm --prefix www run build', { stdio: 'inherit' })

if (!existsSync(outDir)) {
  throw new Error(`Expected static export at ${outDir}, but it does not exist.`)
}

rmSync(staticOutputDir, { recursive: true, force: true })
mkdirSync(staticOutputDir, { recursive: true })
cpSync(outDir, staticOutputDir, { recursive: true })

console.log('Vercel docs output generated at ./.vercel_static')
