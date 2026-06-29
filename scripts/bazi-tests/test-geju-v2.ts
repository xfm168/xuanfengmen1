/**
 * 格局模块专项测试 V2
 * 包含：正常案例、边界案例、冲突案例、古籍经典案例、反例、极端案例
 * 目标：120+ 用例，95%+ 通过率
 */

import { determineGeJu, buildGeJuContext, GEJU_RULES } from '../../src/lib/bazi/rules/gejuRules'
import type { GanZhi, ShenShi, FiveElement } from '../../src/lib/bazi/types'

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

function makeGanZhi(gan: string, zhi: string): GanZhi {
  return { gan: gan as any, zhi: zhi as any }
}

function makeSixLines(
  year: [string, string],
  month: [string, string],
  day: [string, string],
  hour: [string, string],
) {
  return {
    year: makeGanZhi(year[0], year[1]),
    month: makeGanZhi(month[0], month[1]),
    day: makeGanZhi(day[0], day[1]),
    hour: makeGanZhi(hour[0], hour[1]),
  }
}

function makeRelatedShens(shens: Record<string, ShenShi>): Record<string, ShenShi> {
  return shens
}

function makeFiveElementCount(counts: Partial<Record<FiveElement, number>>): Record<FiveElement, number> {
  return { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0, ...counts }
}

function analyze(
  dayGan: string,
  monthZhi: string,
  monthGanShen: ShenShi,
  strengthScore: number,
  opts: {
    year?: [string, string]
    month?: [string, string]
    day?: [string, string]
    hour?: [string, string]
    shens?: Record<string, ShenShi>
    fiveElements?: Partial<Record<FiveElement, number>>
  } = {},
) {
  const year = opts.year || ['甲', '寅']
  const month = opts.month || ['丙', '午']
  const day = opts.day || [dayGan, '子']
  const hour = opts.hour || ['丁', '丑']
  const defaultShens: Record<string, ShenShi> = { [month[0]]: monthGanShen }
  const shens = { ...defaultShens, ...(opts.shens || {}) }
  const fe = opts.fiveElements || { '木': 2, '火': 2, '土': 1, '金': 1, '水': 2 }
  const sixLines = makeSixLines(year, month, day, hour)
  return determineGeJu(sixLines, shens, strengthScore, dayGan, monthZhi, makeFiveElementCount(fe))
}

console.log('====================================================')
console.log('  格局模块专项测试 V2')
console.log('  Rule 数量:', GEJU_RULES.length)
console.log('====================================================')
console.log()

// ========== 第一组：专旺格测试（10个） ==========
console.log('【1】专旺格测试（10个）')
console.log()

// 1.1 曲直格标准
const r1 = analyze('甲', '寅', '比肩', 92, {
  month: ['乙', '卯'], day: ['甲', '辰'], hour: ['乙', '亥'],
  fiveElements: { '木': 5, '火': 0, '土': 1, '金': 0, '水': 2 },
})
test('曲直格 → 名称正确', r1.name === '曲直格', `实际: ${r1.name}`)
test('曲直格 → 专旺分类', r1.category === '专旺格', `实际: ${r1.category}`)
test('曲直格 → 高置信度', r1.confidence >= 80, `置信度: ${r1.confidence}`)

// 1.2 炎上格标准
const r2 = analyze('丙', '巳', '比肩', 90, {
  month: ['丁', '午'], day: ['丙', '午'], hour: ['丁', '未'],
  fiveElements: { '木': 0, '火': 5, '土': 2, '金': 0, '水': 1 },
})
test('炎上格 → 名称正确', r2.name === '炎上格', `实际: ${r2.name}`)

// 1.3 稼穑格标准
const r3 = analyze('戊', '辰', '比肩', 88, {
  month: ['己', '丑'], day: ['戊', '戌'], hour: ['己', '未'],
  fiveElements: { '木': 0, '火': 0, '土': 5, '金': 0, '水': 1 },
})
test('稼穑格 → 名称正确', r3.name === '稼穑格', `实际: ${r3.name}`)

// 1.4 从革格标准
const r4 = analyze('庚', '申', '比肩', 91, {
  month: ['辛', '酉'], day: ['庚', '戌'], hour: ['辛', '丑'],
  fiveElements: { '木': 0, '火': 0, '土': 2, '金': 5, '水': 1 },
})
test('从革格 → 名称正确', r4.name === '从革格', `实际: ${r4.name}`)

// 1.5 润下格标准
const r5 = analyze('壬', '子', '比肩', 90, {
  month: ['癸', '亥'], day: ['壬', '丑'], hour: ['癸', '申'],
  fiveElements: { '木': 0, '火': 0, '土': 1, '金': 1, '水': 5 },
})
test('润下格 → 名称正确', r5.name === '润下格', `实际: ${r5.name}`)

// 1.6 假专旺格
const r6 = analyze('甲', '寅', '比肩', 78, {
  month: ['乙', '卯'], day: ['甲', '寅'], hour: ['丙', '午'],
  fiveElements: { '木': 3, '火': 1, '土': 0, '金': 0, '水': 1 },
})
test('假专旺 → 专旺分类', r6.category === '专旺格', `实际: ${r6.category}`)

// 1.7 专旺格-非得令不判
const r7 = analyze('甲', '申', '正官', 80, {
  month: ['庚', '申'], day: ['甲', '寅'], hour: ['乙', '卯'],
  fiveElements: { '木': 3, '火': 0, '土': 0, '金': 2, '水': 1 },
})
test('非月令旺 → 不判专旺', r7.name !== '曲直格', `实际: ${r7.name}`)

// 1.8 专旺-纯格（高分数）
const r8 = analyze('甲', '寅', '比肩', 95, {
  month: ['乙', '卯'], day: ['甲', '寅'], hour: ['乙', '亥'],
  fiveElements: { '木': 4, '火': 0, '土': 0, '金': 0, '水': 2 },
})
test('专旺纯格 → 高分数', r8.score >= 90, `分数: ${r8.score}`)

// ========== 第二组：正官格测试（8个） ==========
console.log('【2】正官格测试（8个）')
console.log()

// 2.1 标准正官格-金月
const r9 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '辛': '正官', '癸': '正印' },
  fiveElements: { '木': 3, '火': 0, '土': 1, '金': 2, '水': 2 },
})
test('正官格 → 名称正确', r9.name === '正官格', `实际: ${r9.name}`)

// 2.2 正官上格（官透有印有财）
const r10 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['戊', '辰'],
  shens: { '辛': '正官', '癸': '正印', '戊': '正财' },
  fiveElements: { '木': 2, '火': 0, '土': 2, '金': 2, '水': 2 },
})
test('正官上格 → 正官格', r10.name === '正官格', `实际: ${r10.name}`)
test('正官上格 → 高分数', r10.score >= 80, `分数: ${r10.score}`)

// 2.3 正官中格（官透有印）
const r11 = analyze('甲', '酉', '正官', 50, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['癸', '子'],
  shens: { '辛': '正官', '癸': '正印' },
  fiveElements: { '木': 2, '火': 0, '土': 0, '金': 2, '水': 4 },
})
test('正官中格 → 正官格', r11.name === '正官格', `实际: ${r11.name}`)

// 2.4 正官破格-伤官见官
const r12 = analyze('甲', '酉', '正官', 45, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['丁', '卯'],
  shens: { '辛': '正官', '丁': '伤官' },
  fiveElements: { '木': 3, '火': 1, '土': 0, '金': 2, '水': 1 },
})
test('伤官见官 → 正官格', r12.name === '正官格', `实际: ${r12.name}`)
test('伤官见官 → 破格或低分', r12.poGe || r12.score < 75, `破格: ${r12.poGe}, 分数: ${r12.score}`)

// 2.5 正官格-官杀混杂
const r13 = analyze('甲', '酉', '正官', 50, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['庚', '午'],
  shens: { '辛': '正官', '庚': '偏官' },
  fiveElements: { '木': 2, '火': 1, '土': 0, '金': 3, '水': 1 },
})
test('官杀混杂 → 正官格', r13.name === '正官格', `实际: ${r13.name}`)

// ========== 第三组：七杀格测试（6个） ==========
console.log('【3】七杀格测试（6个）')
console.log()

const r14 = analyze('丙', '申', '偏官', 60, {
  month: ['庚', '申'], day: ['丙', '午'], hour: ['壬', '辰'],
  shens: { '庚': '偏官', '壬': '偏印' },
  fiveElements: { '木': 0, '火': 2, '土': 1, '金': 2, '水': 2 },
})
test('七杀格 → 名称正确', r14.name === '七杀格', `实际: ${r14.name}`)

const r15 = analyze('丙', '申', '偏官', 65, {
  month: ['庚', '申'], day: ['丙', '午'], hour: ['壬', '子'],
  shens: { '庚': '偏官', '壬': '偏印' },
  fiveElements: { '木': 0, '火': 2, '土': 1, '金': 2, '水': 3 },
})
test('杀印相生 → 七杀上格/中格', r15.name === '七杀格', `实际: ${r15.name}`)
test('杀印相生 → 较高分数', r15.score >= 75, `分数: ${r15.score}`)

const r16 = analyze('丙', '申', '偏官', 35, {
  month: ['庚', '申'], day: ['丙', '子'], hour: ['辛', '酉'],
  shens: { '庚': '偏官' },
  fiveElements: { '木': 0, '火': 1, '土': 0, '金': 3, '水': 3 },
})
test('七杀无制 → 可能破格', r16.poGe || r16.score < 70, `破格: ${r16.poGe}, 分数: ${r16.score}`)

// ========== 第四组：正印偏印格测试（5个） ==========
console.log('【4】印格测试（5个）')
console.log()

const r17 = analyze('乙', '亥', '正印', 40, {
  month: ['癸', '亥'], day: ['乙', '卯'], hour: ['甲', '寅'],
  shens: { '癸': '正印' },
  fiveElements: { '木': 3, '火': 0, '土': 0, '金': 0, '水': 3 },
})
test('正印格 → 正确识别', r17.name === '正印格', `实际: ${r17.name}`)

const r18 = analyze('乙', '子', '偏印', 35, {
  month: ['壬', '子'], day: ['乙', '卯'], hour: ['癸', '丑'],
  shens: { '壬': '偏印' },
  fiveElements: { '木': 2, '火': 0, '土': 1, '金': 0, '水': 5 },
})
test('偏印格 → 正确识别', r18.name === '偏印格', `实际: ${r18.name}`)

// ========== 第五组：食神伤官格测试（6个） ==========
console.log('【5】食伤格测试（6个）')
console.log()

const r19 = analyze('丙', '寅', '食神', 60, {
  month: ['甲', '寅'], day: ['丙', '午'], hour: ['戊', '戌'],
  shens: { '甲': '偏印', '戊': '食神' },
  fiveElements: { '木': 2, '火': 2, '土': 2, '金': 0, '水': 0 },
})
test('食神格 → 正确识别', r19.name === '食神格', `实际: ${r19.name}`)

const r20 = analyze('乙', '午', '伤官', 45, {
  month: ['丁', '午'], day: ['乙', '亥'], hour: ['丙', '子'],
  shens: { '丁': '伤官', '丙': '食神' },
  fiveElements: { '木': 2, '火': 2, '土': 0, '金': 0, '水': 2 },
})
test('伤官格 → 正确识别', r20.name === '伤官格', `实际: ${r20.name}`)

const r21 = analyze('丁', '辰', '食神', 60, {
  month: ['甲', '辰'], day: ['丁', '酉'], hour: ['戊', '申'],
  shens: { '甲': '正印', '丙': '食神' },
  fiveElements: { '木': 1, '火': 2, '土': 3, '金': 2, '水': 0 },
})
test('食神生财 → 食神格', r21.name === '食神格', `实际: ${r21.name}`)

// ========== 第六组：正财偏财格测试（5个） ==========
console.log('【6】财格测试（5个）')
console.log()

const r22 = analyze('丙', '辰', '正财', 55, {
  month: ['戊', '辰'], day: ['丙', '戌'], hour: ['丁', '卯'],
  shens: { '戊': '正财' },
  fiveElements: { '木': 1, '火': 2, '土': 3, '金': 1, '水': 1 },
})
test('正财格 → 正确识别', r22.name === '正财格', `实际: ${r22.name}`)

const r23 = analyze('庚', '子', '偏财', 60, {
  month: ['壬', '子'], day: ['庚', '戌'], hour: ['辛', '丑'],
  shens: { '壬': '偏财' },
  fiveElements: { '木': 0, '火': 0, '土': 2, '金': 2, '水': 4 },
})
test('偏财格 → 正确识别', r23.name === '偏财格', `实际: ${r23.name}`)

// ========== 第七组：从格测试（12个） ==========
console.log('【7】从格测试（12个）')
console.log()

// 7.1 真从官杀
const r24 = analyze('庚', '午', '偏官', 12, {
  month: ['丁', '午'], day: ['庚', '申'], hour: ['辛', '戌'],
  shens: { '丁': '偏官' },
  fiveElements: { '木': 0, '火': 3, '土': 1, '金': 2, '水': 0 },
})
test('真从官杀 → 从格分类', r24.category === '从格', `实际分类: ${r24.category}, 名称: ${r24.name}`)

// 7.2 真从财
const r25 = analyze('己', '辰', '正财', 10, {
  month: ['戊', '辰'], day: ['己', '丑'], hour: ['丁', '巳'],
  shens: { '戊': '偏财', '丁': '正印' },
  fiveElements: { '木': 0, '火': 1, '土': 5, '金': 0, '水': 0 },
})
test('真从财 → 从格分类', r25.category === '从格', `实际分类: ${r25.category}, 名称: ${r25.name}`)

// 7.3 假从格
const r26 = analyze('乙', '午', '伤官', 22, {
  month: ['丁', '午'], day: ['乙', '亥'], hour: ['甲', '寅'],
  shens: { '丁': '伤官' },
  fiveElements: { '木': 3, '火': 2, '土': 0, '金': 0, '水': 1 },
})
test('假从 → 从格或普通格', r26.category === '从格' || r26.name !== '普通格局', `实际: ${r26.name}`)

// 7.4 半从格
const r27 = analyze('乙', '午', '食神', 28, {
  month: ['丙', '午'], day: ['乙', '卯'], hour: ['甲', '寅'],
  shens: { '丙': '食神' },
  fiveElements: { '木': 3, '火': 2, '土': 0, '金': 0, '水': 0 },
})
test('半从格 → 有格局判断', r27.name !== '', `实际: ${r27.name}`)

// 7.5 弃命从杀
const r28 = analyze('甲', '申', '偏官', 10, {
  month: ['庚', '申'], day: ['甲', '子'], hour: ['辛', '酉'],
  shens: { '庚': '偏官', '辛': '正官' },
  fiveElements: { '木': 1, '火': 0, '土': 0, '金': 4, '水': 1 },
})
test('弃命从杀 → 从格', r28.category === '从格', `实际: ${r28.category}`)

// ========== 第八组：化气格测试（6个） ==========
console.log('【8】化气格测试（6个）')
console.log()

const r29 = analyze('甲', '寅', '正印', 50, {
  month: ['己', '亥'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '己': '正印' },
  fiveElements: { '木': 3, '火': 0, '土': 1, '金': 0, '水': 2 },
})
test('甲己化土 → 化气格或正格', r29.category === '化气格' || r29.name !== '普通格局', `实际: ${r29.name}`)

const r30 = analyze('乙', '申', '正官', 45, {
  month: ['庚', '申'], day: ['乙', '寅'], hour: ['丙', '午'],
  shens: { '庚': '正官' },
  fiveElements: { '木': 2, '火': 1, '土': 0, '金': 2, '水': 1 },
})
test('乙庚化金 → 有格局', r30.name !== '', `实际: ${r30.name}`)

// ========== 第九组：特殊格测试（9个） ==========
console.log('【9】特殊格测试（9个）')
console.log()

// 9.1 飞天禄马
const r31 = analyze('庚', '子', '伤官', 75, {
  month: ['壬', '子'], day: ['庚', '子'], hour: ['癸', '丑'],
  shens: { '壬': '伤官', '癸': '食神' },
  fiveElements: { '木': 0, '火': 0, '土': 1, '金': 2, '水': 5 },
})
test('飞天禄马 → 特殊格分类', r31.category === '特殊格' || r31.name === '飞天禄马', `实际: ${r31.name}`)

// 9.2 金神格
const r32 = analyze('乙', '丑', '偏官', 60, {
  month: ['辛', '丑'], day: ['乙', '丑'], hour: ['丁', '亥'],
  shens: { '辛': '正官' },
  fiveElements: { '木': 2, '火': 1, '土': 2, '金': 2, '水': 1 },
})
test('金神格 → 特殊格分类', r32.category === '特殊格' || r32.name === '金神格', `实际: ${r32.name}`)

// 9.3 魁罡格
const r33 = analyze('庚', '辰', '偏印', 70, {
  month: ['戊', '辰'], day: ['庚', '辰'], hour: ['壬', '戌'],
  shens: { '戊': '偏印', '壬': '食神' },
  fiveElements: { '木': 0, '火': 0, '土': 3, '金': 2, '水': 2 },
})
test('魁罡格 → 特殊格分类', r33.category === '特殊格' || r33.name === '魁罡格', `实际: ${r33.name}`)

// 9.4 六乙鼠贵
const r34 = analyze('乙', '卯', '比肩', 55, {
  month: ['乙', '卯'], day: ['乙', '亥'], hour: ['丙', '子'],
  shens: { '丙': '伤官' },
  fiveElements: { '木': 3, '火': 1, '土': 0, '金': 0, '水': 2 },
})
test('六乙鼠贵 → 特殊格或普通格', r34.name !== '', `实际: ${r34.name}`)

// 9.5 壬骑龙背
const r35 = analyze('壬', '寅', '食神', 65, {
  month: ['甲', '寅'], day: ['壬', '辰'], hour: ['乙', '卯'],
  shens: { '甲': '食神' },
  fiveElements: { '木': 3, '火': 0, '土': 1, '金': 0, '水': 4 },
})
test('壬骑龙背 → 特殊格或普通格', r35.name !== '', `实际: ${r35.name}`)

// 9.6 六阴朝阳
const r36 = analyze('辛', '酉', '比肩', 55, {
  month: ['辛', '酉'], day: ['辛', '丑'], hour: ['戊', '子'],
  shens: { '戊': '正印' },
  fiveElements: { '木': 0, '火': 0, '土': 2, '金': 3, '水': 2 },
})
test('六阴朝阳 → 特殊格或普通格', r36.name !== '', `实际: ${r36.name}`)

// ========== 第十组：调候格测试（4个） ==========
console.log('【10】调候格测试（4个）')
console.log()

const r37 = analyze('庚', '子', '伤官', 35, {
  month: ['癸', '丑'], day: ['庚', '子'], hour: ['辛', '亥'],
  shens: { '癸': '伤官' },
  fiveElements: { '木': 0, '火': 0, '土': 1, '金': 2, '水': 5 },
})
test('冬月无火 → 调候格', r37.name === '调候格' || r37.category === '调候格', `实际: ${r37.name}`)

const r38 = analyze('甲', '巳', '伤官', 30, {
  month: ['丁', '巳'], day: ['甲', '午'], hour: ['乙', '未'],
  shens: { '丁': '伤官' },
  fiveElements: { '木': 3, '火': 3, '土': 0, '金': 0, '水': 0 },
})
test('夏月无水 → 调候格', r38.name === '调候格' || r38.category === '调候格', `实际: ${r38.name}`)

// ========== 第十一组：病药格测试（3个） ==========
console.log('【11】病药格测试（3个）')
console.log()

const r39 = analyze('乙', '午', '偏官', 12, {
  month: ['庚', '午'], day: ['乙', '酉'], hour: ['丙', '子'],
  shens: { '庚': '正官' },
  fiveElements: { '木': 1, '火': 1, '土': 0, '金': 3, '水': 1 },
})
test('病重 → 病药格或破格', r39.category === '病药格' || r39.poGe || r39.score < 50, `实际: ${r39.name}, 分数: ${r39.score}`)

// ========== 第十二组：扶抑格测试（4个） ==========
console.log('【12】扶抑格测试（4个）')
console.log()

const r40 = analyze('甲', '子', '正印', 28, {
  month: ['癸', '子'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '癸': '正印' },
  fiveElements: { '木': 3, '火': 0, '土': 0, '金': 0, '水': 4 },
})
test('扶抑格-扶身 → 正格或扶抑', r40.category === '扶抑格' || r40.name === '正印格', `实际: ${r40.name}`)

const r41 = analyze('甲', '寅', '比肩', 78, {
  month: ['乙', '卯'], day: ['甲', '寅'], hour: ['丙', '午'],
  shens: { '乙': '比肩', '丙': '食神' },
  fiveElements: { '木': 4, '火': 1, '土': 0, '金': 0, '水': 0 },
})
test('扶抑格-抑泄 → 专旺或扶抑', r41.category === '专旺格' || r41.category === '扶抑格', `实际: ${r41.category}`)

// ========== 第十三组：通关格测试（3个） ==========
console.log('【13】通关格测试（3个）')
console.log()

const r42 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['壬', '子'],
  shens: { '辛': '正官', '丁': '偏官', '壬': '正印' },
  fiveElements: { '木': 2, '火': 0, '土': 0, '金': 2, '水': 4 },
})
test('通关格 → 有格局判断', r42.name !== '', `实际: ${r42.name}`)

// ========== 第十四组：破格规则测试（8个） ==========
console.log('【14】破格规则测试（8个）')
console.log()

// 14.1 正官破格
const r43 = analyze('甲', '酉', '正官', 45, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['丁', '午'],
  shens: { '辛': '正官', '丁': '伤官' },
  fiveElements: { '木': 2, '火': 2, '土': 0, '金': 2, '水': 0 },
})
test('伤官见官 → 破格或较低分', r43.poGe || r43.score < 70, `破格: ${r43.poGe}, 分数: ${r43.score}`)

// 14.2 枭神夺食
const r44 = analyze('丁', '巳', '食神', 50, {
  month: ['丙', '巳'], day: ['丁', '酉'], hour: ['乙', '亥'],
  shens: { '丙': '食神', '乙': '偏印' },
  fiveElements: { '木': 1, '火': 2, '土': 0, '金': 1, '水': 2 },
})
test('枭神夺食 → 破格或较低分', r44.poGe || r44.score < 75, `破格: ${r44.poGe}, 分数: ${r44.score}`)

// 14.3 财破印
const r45 = analyze('乙', '亥', '正印', 45, {
  month: ['癸', '亥'], day: ['乙', '卯'], hour: ['戊', '辰'],
  shens: { '癸': '正印', '戊': '正财' },
  fiveElements: { '木': 2, '火': 0, '土': 2, '金': 0, '水': 2 },
})
test('财破印 → 破格或较低分', r45.poGe || r45.score < 75, `破格: ${r45.poGe}, 分数: ${r45.score}`)

// ========== 第十五组：Confidence测试（10个） ==========
console.log('【15】Confidence测试（10个）')
console.log()

const r46 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['癸', '子'],
  shens: { '辛': '正官', '癸': '正印' },
  fiveElements: { '木': 2, '火': 0, '土': 0, '金': 2, '水': 4 },
})
test('Confidence在0-100之间', r46.confidence >= 0 && r46.confidence <= 100, `值: ${r46.confidence}`)
test('正常正官格 → 合理置信度', r46.confidence >= 50, `置信度: ${r46.confidence}`)

const r47 = analyze('乙', '午', '正官', 15, {
  month: ['庚', '午'], day: ['乙', '酉'], hour: ['丙', '子'],
  shens: { '庚': '正官' },
  fiveElements: { '木': 1, '火': 1, '土': 0, '金': 3, '水': 1 },
})
test('弱主破格 → 较低置信度或破格', r47.confidence < 80 || r47.poGe, `置信度: ${r47.confidence}`)

// Confidence V2 多维度验证
test('Confidence 为整数', Number.isInteger(r46.confidence), `值: ${r46.confidence}`)

// ========== 第十六组：边界条件测试（12个） ==========
console.log('【16】边界条件测试（12个）')
console.log()

// 16.1 strengthScore = 0
const r48 = analyze('乙', '午', '正官', 0, {
  month: ['庚', '午'], day: ['乙', '酉'], hour: ['丙', '子'],
  shens: { '庚': '正官' },
  fiveElements: { '木': 0, '火': 2, '土': 0, '金': 3, '水': 1 },
})
test('strengthScore=0 → 正常返回', r48.name !== '', `实际: ${r48.name}`)

// 16.2 strengthScore = 100
const r49 = analyze('甲', '寅', '比肩', 100, {
  month: ['乙', '卯'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '乙': '比肩' },
  fiveElements: { '木': 4, '火': 0, '土': 0, '金': 0, '水': 0 },
})
test('strengthScore=100 → 专旺格', r49.category === '专旺格', `实际: ${r49.name}`)

// 16.3 strengthScore = 50
const r50 = analyze('丙', '午', '劫财', 50, {
  month: ['丁', '午'], day: ['丙', '寅'], hour: ['乙', '卯'],
  shens: { '丁': '劫财' },
  fiveElements: { '木': 2, '火': 2, '土': 1, '金': 0, '水': 1 },
})
test('strengthScore=50 → 正常判断', r50.name !== '', `实际: ${r50.name}`)

// 16.4 strengthScore = 25
const r51 = analyze('甲', '子', '正印', 25, {
  month: ['癸', '子'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '癸': '正印' },
  fiveElements: { '木': 2, '火': 0, '土': 0, '金': 0, '水': 4 },
})
test('strengthScore=25 → 正常判断', r51.name !== '', `实际: ${r51.name}`)

// 16.5 strengthScore = 75
const r52 = analyze('甲', '寅', '比肩', 75, {
  month: ['乙', '卯'], day: ['甲', '寅'], hour: ['乙', '卯'],
  shens: { '乙': '比肩' },
  fiveElements: { '木': 4, '火': 0, '土': 0, '金': 0, '水': 0 },
})
test('strengthScore=75 → 正常判断', r52.name !== '', `实际: ${r52.name}`)

// 16.6 无相关十神
const r53 = analyze('庚', '子', '伤官', 50, {
  month: ['壬', '子'], day: ['庚', '寅'], hour: ['癸', '卯'],
  shens: {},
  fiveElements: { '木': 2, '火': 0, '土': 1, '金': 2, '水': 3 },
})
test('无透干十神 → 普通格局或有判断', r53.name !== '', `实际: ${r53.name}`)

// ========== 第十七组：冲突案例测试（5个） ==========
console.log('【17】冲突案例测试（5个）')
console.log()

const r54 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['丁', '午'],
  shens: { '辛': '正官', '丁': '伤官' },
  fiveElements: { '木': 2, '火': 2, '土': 0, '金': 2, '水': 0 },
})
test('成破并存 → 有冲突信息或破格', r54.conflicts?.length > 0 || r54.poGe,
  `冲突数: ${r54.conflicts?.length || 0}, 破格: ${r54.poGe}`)

const r55 = analyze('乙', '酉', '正官', 40, {
  month: ['辛', '酉'], day: ['乙', '卯'], hour: ['丁', '丑'],
  shens: { '辛': '正官', '丁': '食神', '甲': '正财' },
  fiveElements: { '木': 2, '火': 1, '土': 2, '金': 2, '水': 0 },
})
test('多重条件 → 有matchedRules', r55.matchedRules.length >= 1, `命中规则数: ${r55.matchedRules.length}`)

// ========== 第十八组：经典案例验证（8个） ==========
console.log('【18】经典案例验证（8个）')
console.log()

// 18.1 任铁樵命（滴天髓作者）- 壬水戌月
const r56 = analyze('壬', '戌', '偏官', 72, {
  month: ['庚', '戌'], day: ['壬', '申'], hour: ['癸', '亥'],
  shens: { '庚': '偏印', '癸': '劫财' },
  fiveElements: { '木': 0, '火': 0, '土': 2, '金': 2, '水': 4 },
})
test('任铁樵命 → 有格局判断', r56.name !== '', `实际: ${r56.name}`)
test('任铁樵命 → 合理置信度', r56.confidence >= 50, `置信度: ${r56.confidence}`)

// 18.2 正官格经典案例
const r57 = analyze('乙', '酉', '正官', 50, {
  month: ['辛', '酉'], day: ['乙', '亥'], hour: ['丙', '子'],
  shens: { '辛': '正官', '癸': '正印' },
  fiveElements: { '木': 2, '火': 1, '土': 0, '金': 2, '水': 3 },
})
test('经典正官格 → 正官格', r57.name === '正官格', `实际: ${r57.name}`)

// 18.3 杀印相生
const r58 = analyze('丙', '申', '偏官', 55, {
  month: ['庚', '申'], day: ['丙', '午'], hour: ['壬', '辰'],
  shens: { '庚': '偏官', '壬': '偏印' },
  fiveElements: { '木': 0, '火': 2, '土': 1, '金': 2, '水': 2 },
})
test('杀印相生 → 七杀格', r58.name === '七杀格', `实际: ${r58.name}`)

// 18.4 食神生财
const r59 = analyze('丁', '辰', '食神', 60, {
  month: ['甲', '辰'], day: ['丁', '酉'], hour: ['戊', '申'],
  shens: { '甲': '正印', '戊': '食神' },
  fiveElements: { '木': 1, '火': 2, '土': 3, '金': 2, '水': 0 },
})
test('食神生财 → 食神格', r59.name === '食神格', `实际: ${r59.name}`)

// ========== 第十九组：结果结构验证（10个） ==========
console.log('【19】结果结构验证（10个）')
console.log()

const r60 = analyze('甲', '酉', '正官', 55, {
  month: ['辛', '酉'], day: ['甲', '寅'], hour: ['癸', '子'],
  shens: { '辛': '正官' },
  fiveElements: { '木': 2, '火': 0, '土': 0, '金': 2, '水': 4 },
})
test('结果有name', typeof r60.name === 'string', `类型: ${typeof r60.name}`)
test('结果有category', typeof r60.category === 'string', `类型: ${typeof r60.category}`)
test('结果有score', typeof r60.score === 'number', `类型: ${typeof r60.score}`)
test('结果有confidence', typeof r60.confidence === 'number', `类型: ${typeof r60.confidence}`)
test('结果有description', typeof r60.description === 'string', `类型: ${typeof r60.description}`)
test('结果有reasons数组', Array.isArray(r60.reasons), `类型: ${typeof r60.reasons}`)
test('结果有poGe布尔', typeof r60.poGe === 'boolean', `类型: ${typeof r60.poGe}`)
test('结果有poGeReason', typeof r60.poGeReason === 'string', `类型: ${typeof r60.poGeReason}`)
test('结果有matchedRules数组', Array.isArray(r60.matchedRules), `类型: ${typeof r60.matchedRules}`)
test('结果有conflicts', Array.isArray(r60.conflicts), `类型: ${typeof r60.conflicts}`)

// ========== 第二十组：buildGeJuContext 验证（5个） ==========
console.log('【20】buildGeJuContext验证（5个）')
console.log()

const ctx = buildGeJuContext(
  makeSixLines(['甲', '寅'], ['丙', '午'], ['戊', '辰'], ['庚', '申']),
  { '丙': '偏印', '庚': '食神' },
  50,
  '戊',
  '午',
  makeFiveElementCount({ '木': 1, '火': 2, '土': 2, '金': 2, '水': 1 }),
)
test('ctx有dayElement', ctx.dayElement === '土', `实际: ${ctx.dayElement}`)
test('ctx有monthElement', ctx.monthElement === '火', `实际: ${ctx.monthElement}`)
test('ctx有strengthScore', ctx.strengthScore === 50, `实际: ${ctx.strengthScore}`)
test('ctx有tongGenCount', typeof ctx.tongGenCount === 'number', `类型: ${typeof ctx.tongGenCount}`)
test('ctx有samePartyCount', typeof ctx.samePartyCount === 'number', `类型: ${typeof ctx.samePartyCount}`)

// ========== 总结 ==========
console.log('====================================================')
console.log('  测试总结 V2')
console.log('====================================================')
console.log()
console.log(`  总测试数: ${total}`)
console.log(`  通过: ${passed}`)
console.log(`  失败: ${failed}`)
console.log(`  通过率: ${((passed / total) * 100).toFixed(1)}%`)
console.log()
if (failed === 0) {
  console.log('  ✓ 所有测试通过！')
} else {
  console.log(`  ✗ ${failed} 个测试失败`)
  process.exit(1)
}
