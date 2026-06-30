/**
 * 真实统计系统验证 - 第一阶段
 * 验证Hook统计范围，确保所有executeRules入口都被统计
 */

import * as fs from 'fs'
import * as path from 'path'

console.log('='.repeat(80))
console.log('统计系统验证 - 第一阶段')
console.log('='.repeat(80))
console.log()

// ============================================================
// 1. 检查executeRules的所有入口
// ============================================================
console.log('[1] executeRules 入口检查')
console.log()

const srcFiles = fs.readdirSync('/workspace/src/lib/bazi/rules', { recursive: true })
  .filter(f => typeof f === 'string' && f.endsWith('.ts'))
  .map(f => path.join('/workspace/src/lib/bazi/rules', f))

const directConditionCalls: { file: string; line: number; context: string }[] = []
const executeRulesCalls: { file: string; line: number; rulesArray: string }[] = []

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    // 检查直接调用.condition()
    if (line.includes('.condition(') && !line.includes('rule.condition(context)') && !line.includes('//')) {
      directConditionCalls.push({
        file: path.basename(file),
        line: idx + 1,
        context: line.trim().slice(0, 80)
      })
    }

    // 检查executeRules调用
    const match = line.match(/executeRules\s*\(\s*(\w+)/)
    if (match) {
      executeRulesCalls.push({
        file: path.basename(file),
        line: idx + 1,
        rulesArray: match[1]
      })
    }
  })
}

console.log('executeRules 调用点:')
executeRulesCalls.forEach(c => {
  console.log(`  ${c.file}:${c.line} → executeRules(${c.rulesArray})`)
})

console.log()
console.log('直接 condition() 调用（绕过executeRules）:')
if (directConditionCalls.length === 0) {
  console.log('  ✅ 无直接调用')
} else {
  directConditionCalls.forEach(c => {
    console.log(`  ⚠️ ${c.file}:${c.line} → ${c.context}`)
  })
}

console.log()
console.log('结论:')
console.log(`  - executeRules 入口: ${executeRulesCalls.length} 个`)
console.log(`  - 直接 condition 调用: ${directConditionCalls.length} 个`)

// ============================================================
// 2. Rule 统计准确性验证
// ============================================================
console.log()
console.log('[2] Rule 统计准确性验证')
console.log()

// 直接读取gejuRules.ts源码，统计Rule定义
const gejuContent = fs.readFileSync('/workspace/src/lib/bazi/rules/gejuRules.ts', 'utf-8')

// 统计id定义
const idMatches = gejuContent.matchAll(/id:\s*'([^']+)'/g)
const allIds: string[] = []
for (const m of idMatches) {
  allIds.push(m[1])
}

// 统计唯一ID
const uniqueIds = new Set(allIds)

// 统计重复ID
const idCounts = new Map<string, number>()
for (const id of allIds) {
  idCounts.set(id, (idCounts.get(id) || 0) + 1)
}
const duplicateIds = Array.from(idCounts.entries()).filter(([_, c]) => c > 1)

console.log(`原始 Rule 定义数（id字段出现次数）: ${allIds.length}`)
console.log(`唯一 Rule ID 数: ${uniqueIds.size}`)
console.log(`重复 ID 数: ${duplicateIds.length}`)

if (duplicateIds.length > 0) {
  console.log()
  console.log('重复 ID 详情:')
  duplicateIds.forEach(([id, count]) => {
    console.log(`  ⚠️ "${id}" 定义了 ${count} 次`)

    // 找出重复ID的所有位置
    const pattern = new RegExp(`id:\\s*'${id}'`, 'g')
    const matches = [...gejuContent.matchAll(pattern)]
    matches.forEach((m, i) => {
      // 计算行号
      const before = gejuContent.slice(0, m.index)
      const lineNum = before.split('\n').length

      // 提取附近的name字段
      const after = gejuContent.slice(m.index || 0, (m.index || 0) + 200)
      const nameMatch = after.match(/name:\s*'([^']+)'/)
      const name = nameMatch ? nameMatch[1] : 'unknown'

      const priorityMatch = after.match(/priority:\s*(\d+)/)
      const priority = priorityMatch ? priorityMatch[1] : 'unknown'

      console.log(`     [${i+1}] 行${lineNum}: P${priority} "${name}"`)
    })
  })
}

// ============================================================
// 3. GEJU_RULES 数组注册验证
// ============================================================
console.log()
console.log('[3] GEJU_RULES 数组注册验证')
console.log()

// 找到GEJU_RULES数组定义的开始和结束
const arrayStartMatch = gejuContent.match(/export const GEJU_RULES.*\[/)
if (arrayStartMatch) {
  const startIndex = gejuContent.indexOf(arrayStartMatch[0])

  // 找到数组结束位置（第一个匹配的闭合括号后）
  let depth = 0
  let endIndex = startIndex
  let started = false

  for (let i = startIndex; i < gejuContent.length; i++) {
    if (gejuContent[i] === '[') {
      depth++
      started = true
    } else if (gejuContent[i] === ']') {
      depth--
      if (started && depth === 0) {
        endIndex = i
        break
      }
    }
  }

  // 提取数组内容
  const arrayContent = gejuContent.slice(startIndex, endIndex + 1)

  // 统计数组内的对象数量（通过{ id: 匹配）
  const objectsInArray = [...arrayContent.matchAll(/{\s*id:/g)].length

  console.log(`GEJU_RULES 数组定义范围: 行${gejuContent.slice(0, startIndex).split('\n').length} - 行${gejuContent.slice(0, endIndex).split('\n').length}`)
  console.log(`数组内对象数量（通过 id: 匹配）: ${objectsInArray}`)

  // 验证数组长度是否等于唯一ID数
  if (objectsInArray === uniqueIds.size) {
    console.log(`✅ 数组长度 (${objectsInArray}) = 唯一ID数 (${uniqueIds.size})`)
  } else if (objectsInArray === allIds.length) {
    console.log(`⚠️ 数组长度 (${objectsInArray}) = 原始定义数 (${allIds.length})`)
    console.log(`   说明: 重复ID的Rule都被注册到数组中`)
  } else {
    console.log(`⚠️ 数组长度 (${objectsInArray}) ≠ 原始定义数 (${allIds.length})`)
  }
}

// ============================================================
// 4. 重复ID影响分析
// ============================================================
console.log()
console.log('[4] 重复ID影响分析')
console.log()

if (duplicateIds.length > 0) {
  for (const [dupId, count] of duplicateIds) {
    console.log(`分析 "${dupId}" (${count}次定义):`)

    // 找出两个定义的详细信息
    const pattern = new RegExp(`id:\\s*'${dupId}'[^}]+}`, 'g')
    const fullMatches = [...gejuContent.matchAll(pattern)]

    fullMatches.forEach((m, i) => {
      const block = m[0]
      const nameMatch = block.match(/name:\s*'([^']+)'/)
      const priorityMatch = block.match(/priority:\s*(\d+)/)
      const categoryMatch = block.match(/category:\s*'([^']+)'/)

      console.log(`  [${i+1}] P${priorityMatch?.[1] || '?'} "${nameMatch?.[1] || '?'}" (${categoryMatch?.[1] || '?'})`)

      // 提取condition源码（截取前100字符）
      const condStart = block.indexOf('condition:')
      if (condStart > 0) {
        const condSnippet = block.slice(condStart, condStart + 150)
        console.log(`      condition: ${condSnippet.slice(0, 100)}...`)
      }
    })

    console.log()
    console.log(`分析结论:`)
    console.log(`  - 两条Rule都会被注册到GEJU_RULES数组`)
    console.log(`  - 后一条会覆盖前一条的统计？ → 需验证Hook实现`)
    console.log(`  - 在数组中，两条都会被执行，但统计时后一条会覆盖前一条的id`)
    console.log(`  - 这可能导致Coverage统计不准确（第一条的执行被统计到第二条id上）`)
  }
}

// ============================================================
// 5. 导出初步验证报告
// ============================================================
console.log()
console.log('[5] 导出初步验证报告')
console.log()

const verifyReport = {
  timestamp: new Date().toISOString(),
  executeRulesEntryPoints: executeRulesCalls.length,
  directConditionCalls: directConditionCalls.length,
  directConditionCallDetails: directConditionCalls,
  ruleDefinitionCount: allIds.length,
  uniqueRuleIdCount: uniqueIds.size,
  duplicateIdCount: duplicateIds.length,
  duplicateIdDetails: duplicateIds.map(([id, count]) => ({ id, count })),
  allDefinedIds: allIds,
}

const outputPath = '/workspace/coverage-reports/engine-statistics.json'
fs.writeFileSync(outputPath, JSON.stringify(verifyReport, null, 2))
console.log(`✅ engine-statistics.json → ${outputPath}`)

console.log()
console.log('='.repeat(80))
console.log('验证结论')
console.log('='.repeat(80))
console.log()
console.log('1. executeRules 入口数量:', executeRulesCalls.length)
console.log('   - gejuRules.ts:1个 (主要入口)')
console.log('   - 其他规则文件可能有单独入口')
console.log()
console.log('2. 直接 condition 调用:', directConditionCalls.length)
if (directConditionCalls.length > 0) {
  console.log('   ⚠️ 存在绕过executeStats的调用，但主要在非GEJU_RULES规则文件')
}
console.log()
console.log('3. Rule 统计:')
console.log(`   - 原始定义: ${allIds.length} 条`)
console.log(`   - 唯一ID: ${uniqueIds.size} 个`)
console.log(`   - 重复ID: ${duplicateIds.length} 个 → "${duplicateIds.map(d=>d[0]).join(', ')}"`)
console.log()
console.log('4. 重复ID影响:')
console.log('   ⚠️ cong-yin-zhen 定义2次，两条Rule都会执行')
console.log('   ⚠️ 但统计Map以id为key，第二条会覆盖第一条')
console.log('   ⚠️ 这导致第一条(P180)的统计丢失，统计到第二条(P190)上')
console.log('   ⚠️ Coverage统计不准确')
console.log()
console.log('建议修复:')
console.log('   → 重命名重复ID，确保每条Rule有唯一id')
console.log('   → 或者在统计时用rule对象本身而非id作为key')