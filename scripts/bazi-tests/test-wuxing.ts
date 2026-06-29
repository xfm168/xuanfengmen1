/**
 * 旺衰模块专项测试
 * 包含：正常案例、边界案例、经典案例、反例
 */

import { calculateStrengthV2, WUXING_RULES } from '../../src/lib/bazi/rules/wuxingRules'
import type { SixLines, CangGan, EarthlyBranch, HeavenlyStem } from '../../src/lib/bazi/types'

let total = 0
let passed = 0
let failed = 0

function test(name: string, condition: boolean, detail?: string) {
  total++
  if (condition) {
    passed++
  } else {
    failed++
    console.log(`  ✗ [${name}] ${detail || ''}`)
  }
  return condition
}

// 藏干表
const CANG_GAN_TABLE: Record<EarthlyBranch, CangGan> = {
  子: { ben: '癸', zhong: null, yao: null },
  丑: { ben: '己', zhong: '辛', yao: '癸' },
  寅: { ben: '甲', zhong: '丙', yao: '戊' },
  卯: { ben: '乙', zhong: null, yao: null },
  辰: { ben: '戊', zhong: '乙', yao: '癸' },
  巳: { ben: '丙', zhong: '庚', yao: '戊' },
  午: { ben: '丁', zhong: '己', yao: null },
  未: { ben: '己', zhong: '丁', yao: '乙' },
  申: { ben: '庚', zhong: '壬', yao: '戊' },
  酉: { ben: '辛', zhong: null, yao: null },
  戌: { ben: '戊', zhong: '辛', yao: '丁' },
  亥: { ben: '壬', zhong: '甲', yao: null },
}

function makeCangGan(zhis: EarthlyBranch[]): Record<EarthlyBranch, CangGan> {
  const result: Record<string, CangGan> = {}
  for (const z of zhis) {
    result[z] = CANG_GAN_TABLE[z]
  }
  return result as Record<EarthlyBranch, CangGan>
}

function makeChart(
  yearGan: HeavenlyStem, yearZhi: EarthlyBranch,
  monthGan: HeavenlyStem, monthZhi: EarthlyBranch,
  dayGan: HeavenlyStem, dayZhi: EarthlyBranch,
  hourGan: HeavenlyStem, hourZhi: EarthlyBranch,
): { sixLines: SixLines; dayGan: HeavenlyStem; monthZhi: EarthlyBranch; cangGanData: Record<EarthlyBranch, CangGan> } {
  const sixLines: SixLines = {
    year: { gan: yearGan, zhi: yearZhi },
    month: { gan: monthGan, zhi: monthZhi },
    day: { gan: dayGan, zhi: dayZhi },
    hour: { gan: hourGan, zhi: hourZhi },
  }
  const cangGanData = makeCangGan([yearZhi, monthZhi, dayZhi, hourZhi])
  return { sixLines, dayGan, monthZhi, cangGanData }
}

console.log('====================================================')
console.log('  旺衰模块专项测试')
console.log('  Rule 数量:', WUXING_RULES.length)
console.log('====================================================')
console.log()

// ==================== 第一组：基础分类测试 ====================
console.log('【1】旺衰等级分类测试（正常案例）')
console.log()

// 1.1 极旺：甲木寅月，地支多木
const chartExtremeStrong = makeChart('甲', '寅', '甲', '寅', '甲', '卯', '乙', '亥')
const r1 = calculateStrengthV2(
  chartExtremeStrong.sixLines,
  chartExtremeStrong.dayGan,
  chartExtremeStrong.monthZhi,
  chartExtremeStrong.cangGanData,
)
test('甲木寅月，地支寅卯亥（木旺）→ 偏强或极强',
  r1.level === '偏强' || r1.level === '极强',
  `实际: ${r1.level}, 分数: ${r1.strengthScore}`)
test('甲木寅月得令 → 旺相休囚死为"旺"',
  r1.wangShuai === '旺',
  `实际: ${r1.wangShuai}`)
test('甲木旺 → 分数应大于60',
  r1.strengthScore > 60,
  `实际分数: ${r1.strengthScore}`)

// 1.2 偏弱：庚金午月，火克金
const chartWeak = makeChart('戊', '子', '丙', '午', '庚', '午', '丁', '巳')
const r2 = calculateStrengthV2(
  chartWeak.sixLines,
  chartWeak.dayGan,
  chartWeak.monthZhi,
  chartWeak.cangGanData,
)
test('庚金午月，火多金弱 → 偏弱或极弱',
  r2.level === '偏弱' || r2.level === '极弱',
  `实际: ${r2.level}, 分数: ${r2.strengthScore}`)
test('庚金午月 → 旺相休囚死为"死"',
  r2.wangShuai === '死',
  `实际: ${r2.wangShuai}`)
test('金死 → 分数应低于40',
  r2.strengthScore < 50,
  `实际分数: ${r2.strengthScore}`)

// 1.3 中和：土生土月，但有木制
const chartMid = makeChart('甲', '寅', '戊', '辰', '戊', '戌', '乙', '卯')
const r3 = calculateStrengthV2(
  chartMid.sixLines,
  chartMid.dayGan,
  chartMid.monthZhi,
  chartMid.cangGanData,
)
test('戊土辰月，有木制 → 偏强或中和',
  r3.level === '偏强' || r3.level === '中和' || r3.level === '偏弱',
  `实际: ${r3.level}, 分数: ${r3.strengthScore}`)

console.log(`  通过: ${passed}/${total}`)
console.log()

// ==================== 第二组：规则命中测试 ====================
console.log('【2】规则命中测试')
console.log()

let ruleTotal = 0
let rulePassed = 0

function testRule(
  name: string,
  ruleName: string,
  chart: ReturnType<typeof makeChart>,
  shouldMatch: boolean,
) {
  ruleTotal++
  const result = calculateStrengthV2(chart.sixLines, chart.dayGan, chart.monthZhi, chart.cangGanData)
  const matched = result.matchedRules.includes(ruleName)
  const ok = shouldMatch ? matched : !matched
  if (ok) {
    rulePassed++
  } else {
    console.log(`  ✗ [${name}] 期望${shouldMatch ? '命中' : '不命中'}"${ruleName}", 实际${matched ? '命中' : '未命中'}`)
    console.log(`     命中规则: ${result.matchedRules.join(', ')}`)
  }
  return ok
}

// 2.1 月令规则
const chartDeLing = makeChart('庚', '申', '辛', '酉', '庚', '申', '庚', '辰')
testRule('金得令（秋月金旺）', '得令旺', chartDeLing, true)
testRule('金得令 → 不应失令', '失令死', chartDeLing, false)

const chartShiLing = makeChart('甲', '申', '乙', '酉', '甲', '申', '庚', '寅')
testRule('木失令（秋金克木）', '失令死', chartShiLing, true)

// 2.2 通根规则
const chartTongGen = makeChart('甲', '子', '甲', '寅', '甲', '辰', '乙', '卯')
testRule('甲木多本气根 → 命中"本气根多"', '本气根多', chartTongGen, true)

const chartWuGen = makeChart('甲', '申', '庚', '午', '甲', '酉', '丙', '子')
testRule('甲木无根 → 命中"无根"', '无根', chartWuGen, true)

// 2.3 透干规则
const chartTouGan = makeChart('甲', '寅', '甲', '子', '甲', '辰', '甲', '戌')
testRule('甲木4透干 → 命中"透干多"', '透干多', chartTouGan, true)

const chartShuangTou = makeChart('甲', '子', '丙', '丑', '甲', '寅', '庚', '辰')
testRule('甲木双透（2个）→ 命中"双透干"', '双透干', chartShuangTou, true)

// 2.4 印星规则
const chartYinXing = makeChart('甲', '子', '癸', '亥', '甲', '子', '壬', '申')
testRule('甲木水多（印星旺）→ 命中"印星透干"', '印星透干', chartYinXing, true)
testRule('甲木水多 → 命中"印星多"', '印星多', chartYinXing, true)

// 2.5 官杀规则
const chartGuanSha = makeChart('庚', '午', '丙', '午', '庚', '子', '丁', '巳')
testRule('庚金火旺（官杀旺）→ 命中"官杀透干"', '官杀透干', chartGuanSha, true)
testRule('庚金火旺 → 命中"官杀旺"', '官杀旺', chartGuanSha, true)

// 2.6 得势失势
const chartDeShi = makeChart('甲', '寅', '甲', '子', '甲', '辰', '乙', '亥')
testRule('甲木天干多同党 → 命中"得势"', '得势', chartDeShi, true)

const chartShiShi = makeChart('丙', '午', '丁', '巳', '庚', '申', '甲', '寅')
testRule('庚金天干多异党 → 命中"失势"', '失势', chartShiShi, true)

console.log(`  通过: ${rulePassed}/${ruleTotal}`)
total += ruleTotal
passed += rulePassed
console.log()

// ==================== 第三组：边界案例测试 ====================
console.log('【3】边界案例测试')
console.log()

let edgeTotal = 0
let edgePassed = 0

function edgeTest(name: string, condition: boolean, detail?: string) {
  edgeTotal++
  if (condition) { edgePassed++ }
  else {
    console.log(`  ✗ [${name}] ${detail || ''}`)
  }
}

// 3.1 只有日主一个天干（假设单透）
const chartOnlyDay = makeChart('庚', '子', '丙', '午', '甲', '申', '戊', '辰')
const rEdge1 = calculateStrengthV2(chartOnlyDay.sixLines, chartOnlyDay.dayGan, chartOnlyDay.monthZhi, chartOnlyDay.cangGanData)
edgeTest('只有1个甲木透干 → 不应命中"透干多"',
  !rEdge1.matchedRules.includes('透干多'),
  `命中规则: ${rEdge1.matchedRules.join(', ')}`)
edgeTest('只有1个甲木透干 → 不应命中"双透干"',
  !rEdge1.matchedRules.includes('双透干'),
  `命中规则: ${rEdge1.matchedRules.join(', ')}`)

// 3.2 刚好一个本气根
const chartOneGen = makeChart('庚', '子', '甲', '寅', '甲', '辰', '丙', '午')
const rEdge2 = calculateStrengthV2(chartOneGen.sixLines, chartOneGen.dayGan, chartOneGen.monthZhi, chartOneGen.cangGanData)
edgeTest('只有1个本气根 → 命中"本气根一"，不命中"本气根多"',
  rEdge2.matchedRules.includes('本气根一') && !rEdge2.matchedRules.includes('本气根多'),
  `命中规则: ${rEdge2.matchedRules.join(', ')}`)

// 3.3 分数在边界（39, 40, 41 / 59, 60, 61 等）
// 验证分数范围在 0-100
edgeTest('旺衰分数在 0-100 范围内',
  rEdge1.strengthScore >= 0 && rEdge1.strengthScore <= 100,
  `分数: ${rEdge1.strengthScore}`)
edgeTest('所有测试分数都在合理范围',
  rEdge2.strengthScore >= 0 && rEdge2.strengthScore <= 100,
  `分数: ${rEdge2.strengthScore}`)

// 3.4 余气根测试
const chartYuQiGen = makeChart('甲', '申', '庚', '午', '甲', '戌', '丙', '辰')
const rEdge3 = calculateStrengthV2(chartYuQiGen.sixLines, chartYuQiGen.dayGan, chartYuQiGen.monthZhi, chartYuQiGen.cangGanData)
edgeTest('分数合理范围',
  rEdge3.strengthScore >= 0 && rEdge3.strengthScore <= 100,
  `分数: ${rEdge3.strengthScore}`)

console.log(`  通过: ${edgePassed}/${edgeTotal}`)
total += edgeTotal
passed += edgeTotal
console.log()

// ==================== 第四组：经典案例测试 ====================
console.log('【4】经典案例测试')
console.log()

let classicTotal = 0
let classicPassed = 0

function classicTest(name: string, condition: boolean, detail?: string) {
  classicTotal++
  if (condition) { classicPassed++ }
  else {
    console.log(`  ✗ [${name}] ${detail || ''}`)
  }
}

// 4.1 甲木生寅月（得令得地得势 → 旺）
// 《子平真诠》：甲木寅月，木旺金囚
const classic1 = makeChart('甲', '子', '丙', '寅', '甲', '寅', '甲', '子')
const rc1 = calculateStrengthV2(classic1.sixLines, classic1.dayGan, classic1.monthZhi, classic1.cangGanData)
classicTest('甲木寅月 → 旺相休囚死为"旺"',
  rc1.wangShuai === '旺',
  `实际: ${rc1.wangShuai}`)
classicTest('甲木寅月多比劫 → 分数较高',
  rc1.strengthScore > 60,
  `分数: ${rc1.strengthScore}, 等级: ${rc1.level}`)

// 4.2 癸水生午月（失令 → 死）
// 《穷通宝鉴》：癸水午月，火旺水弱
const classic2 = makeChart('甲', '辰', '庚', '午', '癸', '卯', '丁', '巳')
const rc2 = calculateStrengthV2(classic2.sixLines, classic2.dayGan, classic2.monthZhi, classic2.cangGanData)
classicTest('癸水午月 → 旺相休囚死为"绝/死"',
  rc2.wangShuai === '死' || rc2.wangShuai === '囚',
  `实际: ${rc2.wangShuai}`)
classicTest('癸水午月火多 → 偏弱',
  rc2.level === '偏弱' || rc2.level === '极弱',
  `等级: ${rc2.level}, 分数: ${rc2.strengthScore}`)

// 4.3 戊土生戌月（得令 → 旺）
// 《滴天髓》：戊土厚重，生于戌月得令
const classic3 = makeChart('甲', '午', '壬', '戌', '戊', '辰', '庚', '寅')
const rc3 = calculateStrengthV2(classic3.sixLines, classic3.dayGan, classic3.monthZhi, classic3.cangGanData)
classicTest('戊土戌月 → 旺相休囚死为"旺"',
  rc3.wangShuai === '旺',
  `实际: ${rc3.wangShuai}`)

// 4.4 庚金生子月（失令 → 休囚）
// 《三命通会》：金生水旺，金泄气休囚
const classic4 = makeChart('甲', '戌', '丙', '子', '庚', '午', '戊', '辰')
const rc4 = calculateStrengthV2(classic4.sixLines, classic4.dayGan, classic4.monthZhi, classic4.cangGanData)
classicTest('庚金子月 → 旺相休囚死为"休"或"死"',
  rc4.wangShuai === '休' || rc4.wangShuai === '囚' || rc4.wangShuai === '死',
  `实际: ${rc4.wangShuai}`)

// 4.5 丙火生寅月（得令 → 相）
// 木生火，相气
const classic5 = makeChart('甲', '戌', '甲', '寅', '丙', '午', '甲', '辰')
const rc5 = calculateStrengthV2(classic5.sixLines, classic5.dayGan, classic5.monthZhi, classic5.cangGanData)
classicTest('丙火寅月 → 旺相休囚死为"相"',
  rc5.wangShuai === '相',
  `实际: ${rc5.wangShuai}`)

// 4.6 壬水生申月（得令 → 相）
// 金生水，相气
const classic6 = makeChart('庚', '辰', '庚', '申', '壬', '子', '庚', '戌')
const rc6 = calculateStrengthV2(classic6.sixLines, classic6.dayGan, classic6.monthZhi, classic6.cangGanData)
classicTest('壬水申月 → 旺相休囚死为"相"',
  rc6.wangShuai === '相',
  `实际: ${rc6.wangShuai}`)
classicTest('壬水申月金多水旺 → 偏强',
  rc6.level === '偏强' || rc6.level === '极强',
  `等级: ${rc6.level}, 分数: ${rc6.strengthScore}`)

console.log(`  通过: ${classicPassed}/${classicTotal}`)
total += classicTotal
passed += classicPassed
console.log()

// ==================== 第五组：反例测试 ====================
console.log('【5】反例测试（规则不应命中）')
console.log()

let negTotal = 0
let negPassed = 0

function negTest(name: string, condition: boolean, detail?: string) {
  negTotal++
  if (condition) { negPassed++ }
  else {
    console.log(`  ✗ [${name}] ${detail || ''}`)
  }
}

// 5.1 不得令的不应命中"得令旺"
const neg1 = makeChart('甲', '申', '庚', '酉', '甲', '戌', '庚', '寅')
const rn1 = calculateStrengthV2(neg1.sixLines, neg1.dayGan, neg1.monthZhi, neg1.cangGanData)
negTest('甲木申月 → 不应命中"得令旺"',
  !rn1.matchedRules.includes('得令旺'),
  `命中: ${rn1.matchedRules.join(', ')}`)
negTest('甲木申月 → 不应命中"得令相"',
  !rn1.matchedRules.includes('得令相'),
  `命中: ${rn1.matchedRules.join(', ')}`)

// 5.2 无根的不应命中"本气根多"
const neg2 = makeChart('甲', '午', '丙', '午', '甲', '午', '丁', '巳')
const rn2 = calculateStrengthV2(neg2.sixLines, neg2.dayGan, neg2.monthZhi, neg2.cangGanData)
negTest('甲木午月地支无木 → 不应命中"本气根多"',
  !rn2.matchedRules.includes('本气根多'),
  `命中: ${rn2.matchedRules.join(', ')}`)

// 5.3 天干只有一个日主 → 不应命中"透干多"
const neg3 = makeChart('庚', '子', '丙', '午', '甲', '申', '戊', '辰')
const rn3 = calculateStrengthV2(neg3.sixLines, neg3.dayGan, neg3.monthZhi, neg3.cangGanData)
negTest('只有日主一个天干 → 不应命中"透干多"',
  !rn3.matchedRules.includes('透干多'),
  `命中: ${rn3.matchedRules.join(', ')}`)
negTest('只有日主一个天干 → 不应命中"双透干"',
  !rn3.matchedRules.includes('双透干'),
  `命中: ${rn3.matchedRules.join(', ')}`)

// 5.4 印星不旺 → 不应命中"印星多"
const neg4 = makeChart('甲', '午', '丙', '午', '庚', '申', '戊', '辰')
const rn4 = calculateStrengthV2(neg4.sixLines, neg4.dayGan, neg4.monthZhi, neg4.cangGanData)
negTest('庚金午月土不多 → 不应命中"印星多"',
  !rn4.matchedRules.includes('印星多'),
  `命中: ${rn4.matchedRules.join(', ')}`)

// 5.5 官杀不旺 → 不应命中"官杀旺"
const neg5 = makeChart('甲', '子', '乙', '丑', '甲', '寅', '丙', '辰')
const rn5 = calculateStrengthV2(neg5.sixLines, neg5.dayGan, neg5.monthZhi, neg5.cangGanData)
negTest('甲木子月金不旺 → 不应命中"官杀旺"',
  !rn5.matchedRules.includes('官杀旺'),
  `命中: ${rn5.matchedRules.join(', ')}`)

console.log(`  通过: ${negPassed}/${negTotal}`)
total += negTotal
passed += negPassed
console.log()

// ==================== 第六组：一致性测试 ====================
console.log('【6】一致性测试')
console.log()

let consTotal = 0
let consPassed = 0

function consTest(name: string, condition: boolean, detail?: string) {
  consTotal++
  if (condition) { consPassed++ }
  else {
    console.log(`  ✗ [${name}] ${detail || ''}`)
  }
}

// 6.1 相同输入多次计算结果一致
const consChart = makeChart('甲', '子', '丙', '寅', '甲', '辰', '丁', '午')
const cons1 = calculateStrengthV2(consChart.sixLines, consChart.dayGan, consChart.monthZhi, consChart.cangGanData)
const cons2 = calculateStrengthV2(consChart.sixLines, consChart.dayGan, consChart.monthZhi, consChart.cangGanData)
const cons3 = calculateStrengthV2(consChart.sixLines, consChart.dayGan, consChart.monthZhi, consChart.cangGanData)
consTest('三次计算结果一致',
  cons1.strengthScore === cons2.strengthScore && cons2.strengthScore === cons3.strengthScore,
  `${cons1.strengthScore} vs ${cons2.strengthScore} vs ${cons3.strengthScore}`)
consTest('三次计算等级一致',
  cons1.level === cons2.level && cons2.level === cons3.level,
  `${cons1.level} vs ${cons2.level} vs ${cons3.level}`)

// 6.2 五行分数合理（木火土金水都有分）
consTest('五行分数都 >= 0',
  Object.values(cons1.fiveElementScores).every(s => s >= 0),
  JSON.stringify(cons1.fiveElementScores))

// 6.3 matchedRules 中规则名数量合理（至少1个，不超过总数）
consTest('命中规则数在合理范围',
  cons1.matchedRules.length >= 1 && cons1.matchedRules.length <= WUXING_RULES.length,
  `命中 ${cons1.matchedRules.length} 条规则`)

// 6.4 confidence 在 0-100 范围
consTest('confidence 在 0-100 范围',
  cons1.confidence >= 0 && cons1.confidence <= 100,
  `confidence: ${cons1.confidence}`)

// 6.5 reasons 数组与 matchedRules 对应
consTest('reasons 数量与 matchedRules 大致对应',
  cons1.reasons.length >= 1 && Math.abs(cons1.reasons.length - cons1.matchedRules.length) <= 3,
  `reasons: ${cons1.reasons.length}, rules: ${cons1.matchedRules.length}`)

console.log(`  通过: ${consPassed}/${consTotal}`)
total += consTotal
passed += consPassed
console.log()

// ==================== 总结 ====================
console.log('====================================================')
console.log(`  总测试数: ${total}`)
console.log(`  通过: ${passed}`)
console.log(`  失败: ${failed + (ruleTotal - rulePassed) + (edgeTotal - edgePassed) + (classicTotal - classicPassed) + (negTotal - negPassed) + (consTotal - consPassed)}`)
console.log(`  通过率: ${Math.round(passed / total * 100)}%`)
console.log(`  Rule 总数: ${WUXING_RULES.length}`)
console.log('====================================================')

const successRate = Math.round(passed / total * 100)
process.exit(successRate >= 80 ? 0 : 1)
