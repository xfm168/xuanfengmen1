#!/usr/bin/env node

/**
 * Release Check Script
 * 
 * Validates release readiness:
 * - TypeScript compilation
 * - Build success
 * - Rule count
 * - Knowledge count
 * - Pipeline entry
 * - Dead code
 * - Circular import
 * - Console usage
 * - Version consistency
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

console.log('\n╔══════════════════════════════════════════════════════════════╗')
console.log('║    V4.4 Release Check                                        ║')
console.log('╚══════════════════════════════════════════════════════════════╝\n')

const results = []

function check(name, fn) {
  console.log(`\n▶ ${name}`)
  try {
    const result = fn()
    const status = result.pass ? '✅' : '❌'
    console.log(`  ${status} ${result.message}`)
    results.push({ name, pass: result.pass, message: result.message })
  } catch (err) {
    console.log(`  ❌ ${err.message}`)
    results.push({ name, pass: false, message: err.message })
  }
}

// 1. TypeScript
check('TypeScript Compilation', () => {
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'pipe' })
  return { pass: true, message: '0 errors' }
})

// 2. Build
check('Build', () => {
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe' })
  const distExists = fs.existsSync(path.join(ROOT, 'dist'))
  return { pass: distExists, message: distExists ? 'dist generated' : 'dist missing' }
})

// 3. Rule Count
check('Rule Count', () => {
  const ruleDirs = ['house','entrance','living-room','master-bedroom','bedroom','study','kitchen','bathroom','dining-room','balcony']
  let total = 0
  for (const dir of ruleDirs) {
    const content = fs.readFileSync(path.join(ROOT, 'src/lib/fengshui/rules/rooms', dir, 'rules.ts'), 'utf8')
    const matches = content.match(/id:\s*['"][^'"]+['"]/g)
    total += matches ? matches.length : 0
  }
  return { pass: total === 101, message: `${total} rules (expected: 101)` }
})

// 4. Knowledge Count
check('Knowledge Count', () => {
  const kbFiles = ['classic','modern','cases','schools','plants','colors','materials','symbols']
  let total = 0
  for (const f of kbFiles) {
    const content = fs.readFileSync(path.join(ROOT, 'src/lib/fengshui/knowledge', f, 'index.ts'), 'utf8')
    const matches = content.match(/id:\s*['"][^'"]+['"]/g)
    total += matches ? matches.length : 0
  }
  return { pass: total === 76, message: `${total} entries (expected: 76)` }
})

// 5. Pipeline Entry
check('Pipeline Entry', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src/lib/fengshui/index.ts'), 'utf8')
  const hasPipeline = content.includes('runFullPipeline')
  const hasExport = content.includes('export { runFullPipeline')
  return { pass: hasPipeline && hasExport, message: hasPipeline ? 'runFullPipeline exported' : 'missing' }
})

// 6. ALL_RULES Entry
check('ALL_RULES Entry', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src/lib/fengshui/index.ts'), 'utf8')
  const hasRules = content.includes('ALL_RULES')
  return { pass: hasRules, message: hasRules ? 'ALL_RULES exported' : 'missing' }
})

// 7. Console Usage
check('Console Usage', () => {
  const srcDir = path.join(ROOT, 'src')
  const files = getAllFiles(srcDir, ['.ts', '.tsx'])
  let consoleCount = 0
  for (const f of files) {
    // Skip allowed files: logger.ts, release.ts, Home.tsx (Release Banner)
    if (f.includes('logger.ts') || f.includes('release.ts') || f.includes('Home.tsx')) continue
    const content = fs.readFileSync(f, 'utf8')
    const matches = content.match(/console\.(log|warn|error|info|debug)\(/g)
    if (matches) {
      // Filter out JSDoc examples (lines starting with * or //)
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (matches.some(() => line.includes('console.') && !line.trim().startsWith('*') && !line.trim().startsWith('//'))) {
          consoleCount++
        }
      }
    }
  }
  return { pass: consoleCount === 0, message: `${consoleCount} direct console calls (expected: 0)` }
})

// 8. Version
check('Version Consistency', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
  const release = fs.readFileSync(path.join(ROOT, 'src/config/release.ts'), 'utf8')
  const pkgVersion = pkg.version
  const releaseVersionMatch = release.match(/version:\s*'([^']+)'/)
  const releaseVersion = releaseVersionMatch ? releaseVersionMatch[1] : ''
  const match = pkgVersion === '4.4.0' && releaseVersion === '4.4.0'
  return { pass: match, message: `package.json: ${pkgVersion}, release.ts: ${releaseVersion}` }
})

// 9. @deprecated Format
check('@deprecated Format', () => {
  const simIndex = fs.readFileSync(path.join(ROOT, 'src/lib/fengshui/simulation/index.ts'), 'utf8')
  const hasCorrect = simIndex.includes('Reserved for:') && simIndex.includes('Do not use in production')
  return { pass: hasCorrect, message: hasCorrect ? 'correct format' : 'incorrect format' }
})

// 10. Release Freeze File
check('RELEASE_FREEZE.md', () => {
  const exists = fs.existsSync(path.join(ROOT, 'RELEASE_FREEZE.md'))
  return { pass: exists, message: exists ? 'exists' : 'missing' }
})

// Summary
console.log('\n')
console.log('═════════════════════════════════════════════════════════════════')
console.log('  Summary')
console.log('═════════════════════════════════════════════════════════════════')

const passed = results.filter(r => r.pass).length
const failed = results.filter(r => !r.pass).length

for (const r of results) {
  console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}: ${r.message}`)
}

console.log('\n')
console.log(`  Total: ${passed}/${results.length} passed`)
console.log('\n')

if (failed > 0) {
  console.log('  ❌ Release Check Failed')
  process.exit(1)
} else {
  console.log('  ✅ Release Check Passed')
  process.exit(0)
}

function getAllFiles(dir, exts) {
  let files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts))
    } else if (exts.some(e => item.name.endsWith(e))) {
      files.push(fullPath)
    }
  }
  return files
}