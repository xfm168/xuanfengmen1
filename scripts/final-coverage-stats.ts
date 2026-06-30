/**
 * 修正统计系统 - 使用数组索引而非ID作为key
 * 解决重复ID问题，确保150条Rule全部正确统计
 */

import * as fs from 'fs'
import { GEJU_RULES, buildGeJuContext } from '../src/lib/bazi/rules/gejuRules'

const gans = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const zhis = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const GAN_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

const ZHI_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

const GENERATE: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const BE_GENERATE: Record<string, string> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' }

function getShen(dayGan: string, otherGan: string): string {
  const dayEl = GAN_ELEMENT[dayGan]
  const otherEl = GAN_ELEMENT[otherGan]
  const dayYang = ['甲','丙','戊','庚','壬'].includes(dayGan)
  const otherYang = ['甲','丙','戊','庚','壬'].includes(otherGan)
  const GEN: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const OVR: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
  if (otherEl === dayEl) return dayYang === otherYang ? '比肩' : '劫财'
  if (otherEl === GEN[dayEl]) return dayYang === otherYang ? '食神' : '伤官'
  if (otherEl === OVR[dayEl]) return dayYang === otherYang ? '偏财' : '正财'
  if (dayEl === OVR[otherEl]) return dayYang === otherYang ? '偏官' : '正官'
  if (dayEl === GEN[otherEl]) return dayYang === otherYang ? '偏印' : '正印'
  return '比肩'
}

function makeRS(dayGan: string): Record<string, string> {
  const r: Record<string, string> = {}
  for (const g of gans) r[g] = getShen(dayGan, g)
  return r
}

// ============================================================
console.log('='.repeat(80))
console.log('修正统计系统 - 使用数组索引而非ID')
console.log('='.repeat(80))
console.log()

// ============================================================
// 1. Rule 统计结构（使用数组索引）
// ============================================================

interface RuleStat {
  index: number           // 数组索引（0-149）
  ruleId: string          // 原始ID（可能有重复）
  uniqueKey: string       // 唯一Key: "index-ruleId"
  name: string
  category: string
  priority: number
  conditionSource: string // condition函数源码
  executionCount: number
  matchCount: number
  errorCount: number
  lastError: string | null
  firstMatchContext: string | null
  missReasons: string[]   // 未命中原因分析
}

// 初始化150条Rule的统计（使用索引作为唯一key）
const stats: RuleStat[] = GEJU_RULES.map((rule, index) => ({
  index,
  ruleId: rule.id,
  uniqueKey: `${index}-${rule.id}`,
  name: rule.name,
  category: rule.category,
  priority: rule.priority,
  conditionSource: rule.condition.toString(),
  executionCount: 0,
  matchCount: 0,
  errorCount: 0,
  lastError: null,
  firstMatchContext: null,
  missReasons: [],
}))

console.log(`[初始化] ${stats.length} 条Rule已注册`)
console.log()

// 检查重复ID
const idMap = new Map<string, number[]>()
for (const s of stats) {
  if (!idMap.has(s.ruleId)) idMap.set(s.ruleId, [])
  idMap.get(s.ruleId)!.push(s.index)
}

const dupIds = Array.from(idMap.entries()).filter(([_, indices]) => indices.length > 1)
console.log(`重复ID检测: ${dupIds.length}个`)
dupIds.forEach(([id, indices]) => {
  console.log(`  "${id}" 出现 ${indices.length} 次: 索引 [${indices.join(', ')}]`)
  indices.forEach(idx => {
    console.log(`    - #${idx}: P${stats[idx].priority} "${stats[idx].name}"`)
  })
})

console.log()

// ============================================================
// 2. 运行测试收集数据
// ============================================================
console.log('[运行测试] 生成测试Context...')

// 生成大量测试用例
const contexts: any[] = []

// 全组合：10天干 × 12地支 × 10月干 × 5强度 = 6000
for (const dg of gans) {
  for (const mz of zhis) {
    for (const mg of gans) {
      for (const strength of [10, 30, 50, 70, 90]) {
        const rs = makeRS(dg)
        const fe: any = { '木':1,'火':1,'土':1,'金':1,'水':1 }
        fe[ZHI_ELEMENT[mz]] = 2

        const ctx = buildGeJuContext(
          { year:{gan:gans[2],zhi:zhis[0]}, month:{gan:mg,zhi:mz},
            day:{gan:dg,zhi:zhis[3]}, hour:{gan:gans[4],zhi:zhis[5]} },
          rs as any, strength, dg, mz, fe
        )
        contexts.push(ctx)
      }
    }
  }
}

// 随机补充2000个
for (let i = 0; i < 2000; i++) {
  const dg = gans[Math.floor(Math.random() * 10)]
  const mz = zhis[Math.floor(Math.random() * 12)]
  const mg = gans[Math.floor(Math.random() * 10)]
  const strength = Math.floor(Math.random() * 100)
  const rs = makeRS(dg)
  const fe: any = { '木':1,'火':1,'土':1,'金':1,'水':1 }
  fe[ZHI_ELEMENT[mz]] = 2

  const ctx = buildGeJuContext(
    { year:{gan:gans[Math.floor(Math.random()*10)],zhi:zhis[Math.floor(Math.random()*12)]},
      month:{gan:mg,zhi:mz},
      day:{gan:dg,zhi:zhis[Math.floor(Math.random()*12)]},
      hour:{gan:gans[Math.floor(Math.random()*10)],zhi:zhis[Math.floor(Math.random()*12)]} },
    rs as any, strength, dg, mz, fe
  )
  contexts.push(ctx)
}

console.log(`测试Context数: ${contexts.length}`)
console.log()

// 执行每条Rule的condition
console.log('[执行统计] 遍历所有Rule和Context...')

for (const ctx of contexts) {
  for (let idx = 0; idx < GEJU_RULES.length; idx++) {
    const rule = GEJU_RULES[idx]
    const stat = stats[idx]

    stat.executionCount++

    try {
      const matched = rule.condition(ctx as any)
      if (matched) {
        stat.matchCount++
        if (!stat.firstMatchContext) {
          stat.firstMatchContext = `#${idx} ${ctx.dayGan}日${ctx.monthZhi}月 强度${ctx.strengthScore}`
        }
      }
    } catch (e: any) {
      stat.errorCount++
      stat.lastError = e.message
    }
  }
}

console.log(`统计完成: ${contexts.length} × ${stats.length} = ${contexts.length * stats.length} 次condition执行`)
console.log()

// ============================================================
// 3. Coverage 统计结果
// ============================================================
console.log('[Coverage统计]')
console.log()

const matched = stats.filter(s => s.matchCount > 0)
const unmatched = stats.filter(s => s.matchCount === 0)
const errored = stats.filter(s => s.errorCount > 0)

console.log(`总 Rule 数: ${stats.length}`)
console.log(`已命中 Rule: ${matched.length}`)
console.log(`从未命中 Rule: ${unmatched.length}`)
console.log(`执行错误 Rule: ${errored.length}`)
console.log(`真实 Coverage: **${(matched.length / stats.length * 100).toFixed(1)}%** (${matched.length}/${stats.length})`)
console.log()

// ============================================================
// 4. Dead Rules 分析
// ============================================================
console.log('=' .repeat(80))
console.log('Dead Rules 分析（matchCount = 0）')
console.log('=' .repeat(80))
console.log()

for (const s of unmatched) {
  console.log(`[${s.index}] ${s.name} (P${s.priority})`)
  console.log(`  ruleId: "${s.ruleId}"`)
  console.log(`  category: "${s.category}"`)
  console.log(`  executionCount: ${s.executionCount}`)
  console.log(`  matchCount: ${s.matchCount}`)
  console.log(`  errorCount: ${s.errorCount}`)
  if (s.lastError) {
    console.log(`  lastError: "${s.lastError}"`)
    s.missReasons.push('执行错误')
  }

  // 分析condition源码，找出可能的原因
  const cond = s.conditionSource

  // 检查依赖字段
  const missingFields: string[] = []

  // 检查是否依赖未定义变量
  const undefinedVars: string[] = []
  if (cond.includes('BE_GENERATE') && !cond.includes('BE_GENERATE[')) {
    undefinedVars.push('BE_GENERATE可能未定义')
  }
  if (cond.includes('GENERATE') && !cond.includes('GENERATE[') && !cond.includes('Object.entries(GENERATE)')) {
    undefinedVars.push('GENERATE可能未定义')
  }
  if (cond.includes('ctx.monthGanShen') && cond.includes('===') && !cond.includes('正官') && !cond.includes('七杀')) {
    // 正常依赖，不算缺失
  }

  // 检查condition强度条件
  if (cond.includes('strengthScore < 15')) {
    s.missReasons.push('条件过严: 强度<15，测试数据最低10')
  }
  if (cond.includes('strengthScore < 20')) {
    s.missReasons.push('条件较严: 强度<20')
  }
  if (cond.includes('strengthScore >= 85')) {
    s.missReasons.push('条件过严: 强度>=85，测试数据最高90')
  }
  if (cond.includes('strengthScore >= 90')) {
    s.missReasons.push('条件过严: 强度>=90')
  }

  // 检查通根条件
  if (cond.includes('tongGenCount >= 3')) {
    s.missReasons.push('条件过严: 通根>=3')
  }
  if (cond.includes('tongGenCount >= 4')) {
    s.missReasons.push('条件过严: 通根>=4')
  }

  // 检查五行条件
  if (cond.includes('dayElement ===') && cond.includes('&& ctx.strengthScore >= 85')) {
    const elMatch = cond.match(/dayElement === '([^']+)'/)
    if (elMatch) {
      s.missReasons.push(`专旺格条件: 日主${elMatch[1]} + 强度>=85 + 得令 + 通根>=3`)
    }
  }

  // 检查特定命例条件
  if (s.ruleId === 'feitian-luma') {
    s.missReasons.push('飞天禄马: 需庚日+子时+特殊组合')
  }
  if (s.ruleId === 'jinbai-shuiqing') {
    s.missReasons.push('金白水清: 需金日+金水旺+无火')
  }
  if (s.ruleId === 'muhuo-tongming') {
    s.missReasons.push('木火通明: 需木日+木火旺+无金')
  }
  if (s.ruleId === 'liangshen-chengxiang') {
    s.missReasons.push('两神成象: 需五行恰好2种')
  }

  // 检查从格条件
  if (s.category === '从格' && cond.includes('strengthScore < 15')) {
    s.missReasons.push('真从格: 强度<15极弱条件')
  }

  // 检查调候格条件
  if (s.ruleId === 'hanming-tiaohou') {
    s.missReasons.push('寒命调候: 需冬月+无火调候')
  }
  if (s.ruleId === 'nuanming-tiaohou') {
    s.missReasons.push('暖命调候: 需夏月+无水调候')
  }

  // 检查特殊天干条件
  if (cond.includes('dayGan ===')) {
    const ganMatch = cond.match(/dayGan === '([^']+)'/g)
    if (ganMatch) {
      const gans = ganMatch.map(m => m.match(/'([^']+)'/)?.[1] || '').join('/')
      s.missReasons.push(`限定日干: ${gans}`)
    }
  }

  if (s.missReasons.length === 0 && s.errorCount === 0) {
    s.missReasons.push('测试数据覆盖不足（需构造专用Case）')
  }

  console.log(`  missReasons: ${s.missReasons.join('；')}`)
  console.log(`  condition源码（前200字符）:`)
  console.log(`    ${cond.slice(0, 200).replace(/\n/g, '\\n')}`)
  console.log()
}

// ============================================================
// 5. 重复ID Rule 分析
// ============================================================
console.log('=' .repeat(80))
console.log('重复ID Rule 分析')
console.log('=' .repeat(80))
console.log()

dupIds.forEach(([id, indices]) => {
  console.log(`ID "${id}" 出现 ${indices.length} 次:`)

  indices.forEach(idx => {
    const s = stats[idx]
    console.log()
    console.log(`  [#${idx}] P${s.priority} "${s.name}"`)
    console.log(`    executionCount: ${s.executionCount}`)
    console.log(`    matchCount: ${s.matchCount}`)
    console.log(`    condition源码差异:`)

    // 比较condition源码
    const otherIdx = indices.find(i => i !== idx) || idx
    const otherCond = stats[otherIdx].conditionSource
    const thisCond = s.conditionSource

    if (thisCond === otherCond) {
      console.log(`    ⚠️ condition完全相同`)
    } else {
      // 输出差异片段
      const maxLen = Math.max(thisCond.length, otherCond.length)
      console.log(`    条件不同（长度: ${thisCond.length} vs ${otherCond.length})`)
      console.log(`    本条condition前150字符: ${thisCond.slice(0, 150).replace(/\n/g, '\\n')}`)
    }
  })

  // 分析影响
  const indicesStats = indices.map(idx => stats[idx])
  console.log()
  console.log(`  影响分析:`)
  console.log(`    - 两条Rule在数组中都会被遍历执行`)
  console.log(`    - 真实执行次数: ${indicesStats.map(s => s.executionCount).join(' + ')} 次`)
  console.log(`    - 真实命中次数: ${indicesStats.map(s => s.matchCount).join(' + ')} 次`)
  console.log(`    - 如果用ID统计，第二条会覆盖第一条，导致第一条统计丢失`)
})

console.log()

// ============================================================
// 6. 导出文件
// ============================================================
console.log('=' .repeat(80))
console.log('导出文件')
console.log('=' .repeat(80))
console.log()

// coverage.csv (使用uniqueKey)
const csvLines = ['uniqueKey,ruleId,name,priority,category,executionCount,matchCount,errorCount,coverage']
stats.forEach(s => {
  csvLines.push([
    s.uniqueKey,
    `"${s.ruleId}"`,
    `"${s.name}"`,
    s.priority,
    `"${s.category}"`,
    s.executionCount,
    s.matchCount,
    s.errorCount,
    s.matchCount > 0 ? 'YES' : 'NO',
  ].join(','))
})
fs.writeFileSync('/workspace/coverage-reports/coverage.csv', csvLines.join('\n'))
console.log('✅ coverage.csv')

// dead-rules.json (包含missReasons)
const deadRulesJson = {
  count: unmatched.length,
  rules: unmatched.map(s => ({
    index: s.index,
    ruleId: s.ruleId,
    name: s.name,
    priority: s.priority,
    category: s.category,
    executionCount: s.executionCount,
    matchCount: s.matchCount,
    errorCount: s.errorCount,
    lastError: s.lastError,
    missReasons: s.missReasons,
    conditionSource: s.conditionSource.slice(0, 300),
  })),
}
fs.writeFileSync('/workspace/coverage-reports/dead-rules.json', JSON.stringify(deadRulesJson, null, 2))
console.log('✅ dead-rules.json')

// duplicate-rules.json (重复ID详情)
const dupRulesJson = {
  duplicateIds: dupIds.map(([id, indices]) => ({
    id,
    count: indices.length,
    rules: indices.map(idx => ({
      index: idx,
      ruleId: stats[idx].ruleId,
      name: stats[idx].name,
      priority: stats[idx].priority,
      category: stats[idx].category,
      executionCount: stats[idx].executionCount,
      matchCount: stats[idx].matchCount,
      conditionSource: stats[idx].conditionSource.slice(0, 200),
    })),
  })),
}
fs.writeFileSync('/workspace/coverage-reports/duplicate-rules.json', JSON.stringify(dupRulesJson, null, 2))
console.log('✅ duplicate-rules.json')

// engine-statistics.json (汇总)
const engineStats = {
  timestamp: new Date().toISOString(),
  totalRuleContextCount: contexts.length,
  totalRuleCount: stats.length,
  uniqueRuleIdCount: new Set(stats.map(s => s.ruleId)).size,
  duplicateIdCount: dupIds.length,
  matchedRuleCount: matched.length,
  unmatchedRuleCount: unmatched.length,
  erroredRuleCount: errored.length,
  coveragePercent: (matched.length / stats.length * 100).toFixed(1),
  summary: {
    topMatched: matched.sort((a,b) => b.matchCount - a.matchCount).slice(0, 20).map(s => ({
      uniqueKey: s.uniqueKey,
      name: s.name,
      matchCount: s.matchCount,
      executionCount: s.executionCount,
    })),
    allUnmatched: unmatched.map(s => ({
      uniqueKey: s.uniqueKey,
      name: s.name,
      priority: s.priority,
      missReasons: s.missReasons,
    })),
  },
}
fs.writeFileSync('/workspace/coverage-reports/engine-statistics.json', JSON.stringify(engineStats, null, 2))
console.log('✅ engine-statistics.json')

console.log()
console.log('=' .repeat(80))
console.log('最终统计结果')
console.log('=' .repeat(80))
console.log()
console.log(`Total Rule Count（原始150）: ${stats.length}`)
console.log(`Unique Rule ID Count: ${new Set(stats.map(s => s.ruleId)).size}`)
console.log(`Duplicate ID Count: ${dupIds.length}`)
console.log(`Registered Rule Count: ${stats.length}`)
console.log(`Executed Rule Count: ${stats.filter(s => s.executionCount > 0).length}`)
console.log(`Matched Rule Count: ${matched.length}`)
console.log(`真实 Coverage: **${(matched.length / stats.length * 100).toFixed(1)}%** (${matched.length}/${stats.length})`)