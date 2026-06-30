/**
 * Condition重复检测 - 输出源码Diff和详细分析
 */

import * as fs from 'fs'
import { GEJU_RULES } from '../src/lib/bazi/rules/gejuRules'

console.log('='.repeat(80))
console.log('Condition重复检测 - 源码Diff分析')
console.log('='.repeat(80))
console.log()

// 使用数组索引
const rules = GEJU_RULES.map((r, idx) => ({
  index: idx,
  ...r,
  conditionSource: r.condition.toString(),
}))

// 按condition源码分组
const condGroups = new Map<string, typeof rules>()

for (const r of rules) {
  const key = r.conditionSource
  if (!condGroups.has(key)) condGroups.set(key, [])
  condGroups.get(key)!.push(r)
}

const duplicateConditions = Array.from(condGroups.entries())
  .filter(([_, rs]) => rs.length > 1)
  .sort((a, b) => b[1].length - a[1].length)

console.log(`发现 ${duplicateConditions.length} 组Condition完全相同的Rule`)
console.log()

for (const [condSource, rs] of duplicateConditions) {
  console.log('-'.repeat(80))
  console.log(`Condition组（${rs.length}条Rule）:`)
  console.log()

  // 输出每条Rule详情
  rs.forEach((r, i) => {
    console.log(`[${i+1}] #${r.index} ${r.id} P${r.priority} "${r.name}" (${r.category})`)
    console.log(`    result.name: "${r.result?.name}"`)
    console.log(`    result.category: "${r.result?.category}"`)
    console.log(`    result.score: ${r.result?.score}`)
    console.log(`    result.poGe: ${r.result?.poGe}`)
    console.log(`    weight: ${r.weight}`)
  })

  console.log()

  // 分析重复类型
  const priorities = rs.map(r => r.priority)
  const names = rs.map(r => r.name)
  const categories = rs.map(r => r.category)
  const resultNames = rs.map(r => r.result?.name)
  const resultCategories = rs.map(r => r.result?.category)
  const weights = rs.map(r => r.weight)

  console.log('重复类型分析:')

  // Priority差异
  if (priorities.every(p => p === priorities[0])) {
    console.log(`  ✅ Priority相同: 全部 P${priorities[0]}`)
  } else {
    console.log(`  ⚠️ Priority不同: [${priorities.join(', ')}]`)
    console.log(`     建议: 按用途保留或调整优先级`)
  }

  // Name差异
  if (names.every(n => n === names[0])) {
    console.log(`  ⚠️ Name相同: "${names[0]}" → 完全重复，建议删除`)
  } else {
    console.log(`  ✅ Name不同: [${names.map(n => `"${n}"`).join(', ')}]`)
    console.log(`     说明: 不同名称表达相同逻辑`)
  }

  // Category差异
  if (categories.every(c => c === categories[0])) {
    console.log(`  ✅ Category相同: "${categories[0]}"`)
  } else {
    console.log(`  ⚠️ Category不同: [${categories.join(', ')}]`)
    console.log(`     说明: 相同逻辑归属不同分类`)
  }

  // Result差异
  if (resultNames.every(n => n === resultNames[0])) {
    console.log(`  ✅ Result.name相同: "${resultNames[0]}"`)
  } else {
    console.log(`  ⚠️ Result.name不同: [${resultNames.map(n => `"${n}"`).join(', ')}]`)
    console.log(`     说明: 命中后输出不同格局名`)
  }

  // Weight差异
  if (weights.every(w => w === weights[0])) {
    console.log(`  ✅ Weight相同: ${weights[0]}`)
  } else {
    console.log(`  ⚠️ Weight不同: [${weights.join(', ')}]`)
    console.log(`     影响: Confidence计算时会使用不同权重`)
  }

  console.log()

  // Condition源码（完整）
  console.log('Condition源码（完整）:')
  console.log(condSource.slice(0, 500))
  if (condSource.length > 500) {
    console.log(`... (共${condSource.length}字符)`)
  }

  console.log()

  // 建议
  console.log('建议处理方式:')
  if (priorities.every(p => p === priorities[0]) && names.every(n => n === names[0])) {
    console.log('  ⚠️ 完全重复（Priority + Name + Condition都相同）')
    console.log('  → 删除其中一条，保留优先级较高或更合理的一条')
  } else if (resultNames.every(n => n === resultNames[0])) {
    console.log('  ⚠️ Condition + Result相同，但Priority不同')
    console.log('  → 合并为一条，或明确不同优先级的用途')
  } else {
    console.log('  ✅ Condition相同但Result不同')
    console.log('  → 可能是「同一条件，不同输出」的设计')
    console.log('  → 需要检查executeRules是否只取最高优先级的一条')
  }

  console.log()
}

// ============================================================
// 导出详细报告
// ============================================================
console.log('='.repeat(80))
console.log('导出Condition重复报告')
console.log('='.repeat(80))

const dupReport = {
  totalGroups: duplicateConditions.length,
  totalRulesAffected: duplicateConditions.reduce((sum, [_, rs]) => sum + rs.length, 0),
  groups: duplicateConditions.map(([condSource, rs]) => ({
    conditionLength: condSource.length,
    conditionPreview: condSource.slice(0, 300),
    ruleCount: rs.length,
    rules: rs.map(r => ({
      index: r.index,
      ruleId: r.id,
      name: r.name,
      category: r.category,
      priority: r.priority,
      weight: r.weight,
      resultName: r.result?.name,
      resultCategory: r.result?.category,
      resultScore: r.result?.score,
      resultPoGe: r.result?.poGe,
    })),
    analysis: {
      prioritySame: rs.every(r => r.priority === rs[0].priority),
      nameSame: rs.every(r => r.name === rs[0].name),
      categorySame: rs.every(r => r.category === rs[0].category),
      resultSame: rs.every(r => r.result?.name === rs[0].result?.name),
    },
  })),
}

fs.writeFileSync('/workspace/coverage-reports/condition-duplicates.json', JSON.stringify(dupReport, null, 2))
console.log('✅ condition-duplicates.json')

// ============================================================
// 汇总
// ============================================================
console.log()
console.log('汇总:')
console.log(`- Condition完全重复组数: ${duplicateConditions.length}`)
console.log(`- 涉及Rule总数: ${dupReport.totalRulesAffected}`)
console.log(`- 其中完全重复（需删除）: ${duplicateConditions.filter(([_,rs]) => rs.every(r => r.priority === rs[0].priority) && rs.every(r => r.name === rs[0].name)).length}组`)