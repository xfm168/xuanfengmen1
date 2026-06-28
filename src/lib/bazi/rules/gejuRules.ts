/**
 * 格局规则引擎
 * 基于月令、透干、通根等综合判断命局格局
 */

import type { GanZhi, ShenShi, FiveElement } from '../types'
import type { GeJuName } from '../geju'

export interface GeJuContext {
  sixLines: {
    year: GanZhi
    month: GanZhi
    day: GanZhi
    hour: GanZhi
  }
  relatedShens: Record<string, ShenShi>
  monthElement: FiveElement      // 月令主气五行
  monthZhi: string              // 月支
  dayElement: FiveElement       // 日主五行
  dayYinYang: '阳' | '阴'       // 日主阴阳
  strengthScore: number          // 身强身弱评分 0-100
 透干Count: number              // 透干数量
 通根Count: number              // 通根数量
}

export interface GeJuRule {
  id: string
  priority: number
  name: string
  condition: (ctx: GeJuContext) => boolean
  result: {
    name: GeJuName
    isSpecial: boolean
    description: string
    reasons: string[]
  }
}

/**
 * 判断是否从格
 * 条件：日主在月令极弱，且无根或根被冲破
 */
function isCongGe(ctx: GeJuContext): { isCong: boolean; type: '官杀' | '财' | '印' | '儿' | null } {
  const { dayElement, monthElement, strengthScore } = ctx

  // 从官杀格：月令为官杀，日主极弱
  if (monthElement === dayElement && strengthScore < 20) {
    return { isCong: true, type: '官杀' }
  }

  // 从财格：月令为财，日主极弱
  const OVERCOME: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
  }
  if (OVERCOME[dayElement] === monthElement && strengthScore < 20) {
    return { isCong: true, type: '财' }
  }

  // 从印格：月令为印，日主极弱
  const GENERATE: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  }
  if (GENERATE[dayElement] === monthElement && strengthScore < 20) {
    return { isCong: true, type: '印' }
  }

  // 从儿格：月令为食伤，日主极弱
  if (GENERATE[monthElement] === dayElement && strengthScore < 20) {
    return { isCong: true, type: '儿' }
  }

  return { isCong: false, type: null }
}

/**
 * 判断是否专旺格
 * 条件：日主在月令极旺，且无克泄或克泄被合化
 */
function isZhuanWangGe(ctx: GeJuContext): boolean {
  const { dayElement, monthElement, strengthScore } = ctx

  // 专旺格：月令与日主相同，且极强
  if (monthElement === dayElement && strengthScore > 85) {
    return true
  }

  return false
}

/**
 * 判断是否化气格
 * 条件：月令与日主相合化，且化气成势
 */
function isHuaQiGe(ctx: GeJuContext): { isHua: boolean; type: string | null } {
  const { monthElement, strengthScore } = ctx

  // 合化关系表
  const HUA_RELATIONS: Record<string, { element: string; condition: string }[]> = {
    '甲': [{ element: '己', condition: '土' }], // 甲己合化土
    '乙': [{ element: '庚', condition: '金' }], // 乙庚合化金
    '丙': [{ element: '辛', condition: '金' }], // 丙辛合化水
    '丁': [{ element: '壬', condition: '水' }], // 丁壬合化木
    '戊': [{ element: '癸', condition: '火' }], // 戊癸合化火
    '己': [{ element: '甲', condition: '木' }], // 甲己合化土
    '庚': [{ element: '乙', condition: '木' }], // 乙庚合化金
    '辛': [{ element: '丙', condition: '火' }], // 丙辛合化水
    '壬': [{ element: '丁', condition: '木' }], // 丁壬合化木
    '癸': [{ element: '戊', condition: '火' }], // 戊癸合化火
  }

  const dayGan = ctx.sixLines.day.gan
  const relations = HUA_RELATIONS[dayGan]
  if (!relations) return { isHua: false, type: null }

  for (const rel of relations) {
    if (monthElement === rel.element && strengthScore > 70) {
      return { isHua: true, type: rel.condition }
    }
  }

  return { isHua: false, type: null }
}

// 格局规则列表
export const GEJU_RULES: GeJuRule[] = [
  // ========== 从格规则 ==========
  {
    id: 'cong-guan-sha',
    priority: 100,
    name: '从官杀格',
    condition: (ctx) => {
      const cong = isCongGe(ctx)
      return cong.isCong && cong.type === '官杀'
    },
    result: {
      name: '从官杀格',
      isSpecial: true,
      description: '日主极弱，官杀当令成势，不得不从。',
      reasons: ['月令官杀成势', '日主极弱无根'],
    },
  },
  {
    id: 'cong-cai',
    priority: 100,
    name: '从财格',
    condition: (ctx) => {
      const cong = isCongGe(ctx)
      return cong.isCong && cong.type === '财'
    },
    result: {
      name: '从财格',
      isSpecial: true,
      description: '日主极弱，财星当令成势，不得不从。',
      reasons: ['月令财星成势', '日主极弱无根'],
    },
  },
  {
    id: 'cong-yin',
    priority: 100,
    name: '从印格',
    condition: (ctx) => {
      const cong = isCongGe(ctx)
      return cong.isCong && cong.type === '印'
    },
    result: {
      name: '从印格',
      isSpecial: true,
      description: '日主极弱，印星当令成势，不得不从。',
      reasons: ['月令印星成势', '日主极弱无根'],
    },
  },
  {
    id: 'cong-er',
    priority: 100,
    name: '从儿格',
    condition: (ctx) => {
      const cong = isCongGe(ctx)
      return cong.isCong && cong.type === '儿'
    },
    result: {
      name: '从儿格',
      isSpecial: true,
      description: '日主极弱，食伤当令成势，不得不从。',
      reasons: ['月令食伤成势', '日主极弱无根'],
    },
  },

  // ========== 专旺格规则 ==========
  {
    id: 'zhuan-wang',
    priority: 100,
    name: '专旺格',
    condition: (ctx) => isZhuanWangGe(ctx),
    result: {
      name: '专旺格',
      isSpecial: true,
      description: '日主极旺，月令同气一方，顺其势而得用。',
      reasons: ['月令与日主同气', '日主极旺无制'],
    },
  },

  // ========== 化气格规则 ==========
  {
    id: 'hua-qi',
    priority: 100,
    name: '化气格',
    condition: (ctx) => isHuaQiGe(ctx).isHua,
    result: {
      name: '化气格',
      isSpecial: true,
      description: '日主与月令相合化气成功，成特殊格局。',
      reasons: ['日月相合', '化气得势'],
    },
  },

  // ========== 普通格局规则 ==========
  {
    id: 'zheng-guan',
    priority: 50,
    name: '正官格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '正官' && ctx.strengthScore >= 40 && ctx.strengthScore <= 70
    },
    result: {
      name: '正官格',
      isSpecial: false,
      description: '月令正官，官星得用，贵气临身。',
      reasons: ['月令正官', '身强官旺'],
    },
  },
  {
    id: 'pian-sha',
    priority: 50,
    name: '七杀格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '偏官' && ctx.strengthScore >= 40
    },
    result: {
      name: '七杀格',
      isSpecial: false,
      description: '月令七杀，杀印相生，威权显赫。',
      reasons: ['月令七杀', '身强能抗杀'],
    },
  },
  {
    id: 'zheng-yin',
    priority: 50,
    name: '正印格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '正印' && ctx.strengthScore <= 70
    },
    result: {
      name: '正印格',
      isSpecial: false,
      description: '月令正印，印星当令，文章盖世。',
      reasons: ['月令正印', '印星清粹'],
    },
  },
  {
    id: 'pian-yin',
    priority: 50,
    name: '偏印格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '偏印' && ctx.strengthScore <= 70
    },
    result: {
      name: '偏印格',
      isSpecial: false,
      description: '月令偏印，创意独特，技艺成名。',
      reasons: ['月令偏印'],
    },
  },
  {
    id: 'shi-shen',
    priority: 50,
    name: '食神格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '食神' && ctx.strengthScore >= 40
    },
    result: {
      name: '食神格',
      isSpecial: false,
      description: '月令食神，泄秀生财，福禄双全。',
      reasons: ['月令食神', '食神泄秀'],
    },
  },
  {
    id: 'shang-guan',
    priority: 50,
    name: '伤官格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '伤官'
    },
    result: {
      name: '伤官格',
      isSpecial: false,
      description: '月令伤官，伤官伤尽，聪明异常。',
      reasons: ['月令伤官'],
    },
  },
  {
    id: 'zheng-cai',
    priority: 50,
    name: '正财格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '正财' && ctx.strengthScore >= 50
    },
    result: {
      name: '正财格',
      isSpecial: false,
      description: '月令正财，勤劳致富，理财有方。',
      reasons: ['月令正财', '身强能担财'],
    },
  },
  {
    id: 'pian-cai',
    priority: 50,
    name: '偏财格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '偏财' && ctx.strengthScore >= 50
    },
    result: {
      name: '偏财格',
      isSpecial: false,
      description: '月令偏财，商贾之人，财运亨通。',
      reasons: ['月令偏财', '身强能发财'],
    },
  },
  {
    id: 'bi-jian',
    priority: 50,
    name: '比肩格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '比肩' && ctx.strengthScore >= 50
    },
    result: {
      name: '比肩格',
      isSpecial: false,
      description: '月令比肩，自立自强，竞争得胜。',
      reasons: ['月令比肩', '身强比旺'],
    },
  },
  {
    id: 'jie-cai',
    priority: 50,
    name: '劫财格',
    condition: (ctx) => {
      const monthShen = ctx.relatedShens[ctx.sixLines.month.gan]
      return monthShen === '劫财'
    },
    result: {
      name: '劫财格',
      isSpecial: false,
      description: '月令劫财，争夺为用，晚景可期。',
      reasons: ['月令劫财'],
    },
  },
]

/**
 * 根据上下文应用格局规则
 */
export function applyGeJuRules(ctx: GeJuContext): GeJuRule['result'] {
  // 按优先级排序，优先检查高优先级规则
  const sortedRules = [...GEJU_RULES].sort((a, b) => b.priority - a.priority)

  for (const rule of sortedRules) {
    if (rule.condition(ctx)) {
      return rule.result
    }
  }

  // 默认普通格局
  return {
    name: '普通格局',
    isSpecial: false,
    description: '命局五行较平衡，无特殊格局。',
    reasons: ['五行平衡'],
  }
}

/**
 * 格局评分（0-100）
 */
export function calculateGeJuScore(ctx: GeJuContext): number {
  let score = 50

  // 特殊格局加分
  const cong = isCongGe(ctx)
  if (cong.isCong) {
    score += 30
  }

  const zhuanWang = isZhuanWangGe(ctx)
  if (zhuanWang) {
    score += 30
  }

  const huaQi = isHuaQiGe(ctx)
  if (huaQi.isHua) {
    score += 25
  }

  // 格局清纯加分
  if (ctx.透干Count === 1) score += 10
  if (ctx.透干Count >= 3) score -= 10

  // 通根情况
  if (ctx.通根Count >= 3) score += 10
  if (ctx.通根Count === 0) score -= 10

  // 月令是否得势
  if (ctx.monthElement === ctx.dayElement) score += 15

  return Math.max(0, Math.min(100, score))
}

/**
 * 判断格局是否破格
 */
export function isPoGe(ctx: GeJuContext): { isPo: boolean; reason: string } {
  // 从格被逆破
  const cong = isCongGe(ctx)
  if (cong.isCong) {
    // 日主有根被扶起
    if (ctx.strengthScore > 35) {
      return { isPo: true, reason: '从格不纯，日主得根扶起' }
    }
  }

  // 专旺格被克破
  if (isZhuanWangGe(ctx)) {
    // 专旺格被克破的判断
    // 简化处理
  }

  return { isPo: false, reason: '' }
}
