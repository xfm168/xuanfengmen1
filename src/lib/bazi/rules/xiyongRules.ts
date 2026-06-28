/**
 * 喜用神规则引擎
 * 综合身强身弱、格局、调候、病药等因素确定喜忌神
 */

import type { FiveElement, WuXingWangShuai } from '../types'
import type { GeJuName } from '../geju'

export interface XiYongContext {
  dayElement: FiveElement        // 日主五行
  dayYinYang: '阳' | '阴'       // 日主阴阳
  strengthScore: number          // 身强身弱评分 0-100
  wangShuai: WuXingWangShuai    // 月令旺相休囚死
  geJuName: GeJuName            // 格局名称
  isSpecialGe: boolean          // 是否特殊格局
  monthZhi: string              // 月支
  monthElement: FiveElement     // 月令主气
  fiveElementCount: Record<FiveElement, number>  // 五行数量
  hasTiaoHou: boolean           // 是否有调候需要
  hasBingYao: boolean           // 是否有病药需要
  seasonalBias: '燥' | '湿' | null  // 季节偏向
}

export interface XiYongResult {
  bestElement: FiveElement   // 喜神
  usageElement?: FiveElement // 用神
  avoidedElements: FiveElement[] // 忌神
  enemyElements: FiveElement[]  // 仇神
  idleElements: FiveElement[]  // 闲神
  explanation: string
}

export interface XiYongRule {
  id: string
  priority: number
  name: string
  condition: (ctx: XiYongContext) => boolean
  result: XiYongResult
}

// 五行相生相克
const GENERATE: Record<FiveElement, FiveElement> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}

const OVERCOME: Record<FiveElement, FiveElement> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
}

// 喜用神规则列表
export const XIYONG_RULES: XiYongRule[] = [
  // ========== 特殊格局喜用神 ==========
  {
    id: 'special-cong-guan',
    priority: 200,
    name: '从官杀格喜忌',
    condition: (ctx) => ctx.isSpecialGe && (ctx.geJuName === '从官杀格' || ctx.geJuName === '七杀格'),
    result: {
      bestElement: '水',
      usageElement: '金',
      avoidedElements: ['木', '火'],
      enemyElements: ['土'],
      idleElements: [],
      explanation: '从官杀格，官杀当令，宜顺其势，用印化杀生身。',
    },
  },

  // ========== 身强身弱基本喜用 ==========
  {
    id: 'shen-qiang-guan',
    priority: 100,
    name: '身强官杀格',
    condition: (ctx) => ctx.strengthScore >= 65 && (ctx.geJuName === '正官格' || ctx.geJuName === '七杀格'),
    result: {
      bestElement: '火',
      usageElement: '土',
      avoidedElements: ['木', '水'],
      enemyElements: ['金'],
      idleElements: [],
      explanation: '身强官杀格，喜财星生官杀，用神为财。',
    },
  },
  {
    id: 'shen-qiang-yin',
    priority: 100,
    name: '身强印格',
    condition: (ctx) => ctx.strengthScore >= 65 && (ctx.geJuName === '正印格' || ctx.geJuName === '偏印格'),
    result: {
      bestElement: '火',
      usageElement: '木',
      avoidedElements: ['土', '金'],
      enemyElements: ['水'],
      idleElements: [],
      explanation: '身强印格，印星过旺，喜财星制印或食伤泄秀。',
    },
  },
  {
    id: 'shen-qiang-shi',
    priority: 100,
    name: '身强食伤格',
    condition: (ctx) => ctx.strengthScore >= 65 && (ctx.geJuName === '食神格' || ctx.geJuName === '伤官格'),
    result: {
      bestElement: '土',
      usageElement: '金',
      avoidedElements: ['木', '水'],
      enemyElements: ['火'],
      idleElements: [],
      explanation: '身强食伤格，食伤泄秀有力，喜财星生发。',
    },
  },
  {
    id: 'shen-qiang-cai',
    priority: 100,
    name: '身强财格',
    condition: (ctx) => ctx.strengthScore >= 65 && (ctx.geJuName === '正财格' || ctx.geJuName === '偏财格'),
    result: {
      bestElement: '木',
      usageElement: '水',
      avoidedElements: ['土', '火'],
      enemyElements: ['金'],
      idleElements: [],
      explanation: '身强财格，财星当令，喜官杀卫财。',
    },
  },
  {
    id: 'shen-ruo-yin',
    priority: 100,
    name: '身弱印格',
    condition: (ctx) => ctx.strengthScore <= 35 && (ctx.geJuName === '正印格' || ctx.geJuName === '偏印格'),
    result: {
      bestElement: '木',
      usageElement: '水',
      avoidedElements: ['土', '金'],
      enemyElements: ['火'],
      idleElements: [],
      explanation: '身弱印格，印星生身最吉，比劫助身次之。',
    },
  },
  {
    id: 'shen-ruo-guan',
    priority: 100,
    name: '身弱官杀格',
    condition: (ctx) => ctx.strengthScore <= 35 && (ctx.geJuName === '正官格' || ctx.geJuName === '七杀格'),
    result: {
      bestElement: '水',
      usageElement: '木',
      avoidedElements: ['火', '土'],
      enemyElements: ['金'],
      idleElements: [],
      explanation: '身弱官杀格，官杀攻身，喜印星化杀生身。',
    },
  },
  {
    id: 'shen-ruo-shi',
    priority: 100,
    name: '身弱食伤格',
    condition: (ctx) => ctx.strengthScore <= 35 && (ctx.geJuName === '食神格' || ctx.geJuName === '伤官格'),
    result: {
      bestElement: '火',
      usageElement: '土',
      avoidedElements: ['金', '木'],
      enemyElements: ['水'],
      idleElements: [],
      explanation: '身弱食伤格，食伤泄身过甚，喜印星制食伤。',
    },
  },

  // ========== 调候喜用 ==========
  {
    id: 'tiao-hou-winter',
    priority: 150,
    name: '冬季调候',
    condition: (ctx) => ctx.hasTiaoHou && (ctx.monthZhi === '子' || ctx.monthZhi === '亥'),
    result: {
      bestElement: '火',
      usageElement: '土',
      avoidedElements: ['水'],
      enemyElements: ['木'],
      idleElements: ['金'],
      explanation: '冬水寒凉，喜火调候暖局。',
    },
  },
  {
    id: 'tiao-hou-summer',
    priority: 150,
    name: '夏季调候',
    condition: (ctx) => ctx.hasTiaoHou && (ctx.monthZhi === '午' || ctx.monthZhi === '巳'),
    result: {
      bestElement: '水',
      usageElement: '金',
      avoidedElements: ['火'],
      enemyElements: ['土'],
      idleElements: ['木'],
      explanation: '夏火炎燥，喜水调候润局。',
    },
  },

  // ========== 中和偏颇 ==========
  {
    id: 'zhong-he-qiang',
    priority: 50,
    name: '中和偏强',
    condition: (ctx) => ctx.strengthScore > 55 && ctx.strengthScore < 65,
    result: {
      bestElement: '木',
      usageElement: '火',
      avoidedElements: ['水'],
      enemyElements: [],
      idleElements: ['金', '土'],
      explanation: '中和偏强，喜食伤泄秀顺势。',
    },
  },
  {
    id: 'zhong-he-ruo',
    priority: 50,
    name: '中和偏弱',
    condition: (ctx) => ctx.strengthScore > 35 && ctx.strengthScore <= 55,
    result: {
      bestElement: '水',
      usageElement: '木',
      avoidedElements: [],
      enemyElements: [],
      idleElements: ['火', '土'],
      explanation: '中和偏弱，喜印比助身。',
    },
  },
]

/**
 * 应用喜用神规则
 */
export function applyXiYongRules(ctx: XiYongContext): XiYongResult {
  // 按优先级排序
  const sortedRules = [...XIYONG_RULES].sort((a, b) => b.priority - a.priority)

  for (const rule of sortedRules) {
    if (rule.condition(ctx)) {
      return rule.result
    }
  }

  // 默认规则：基于身强身弱
  if (ctx.strengthScore >= 65) {
    return {
      bestElement: GENERATE[ctx.dayElement],
      usageElement: OVERCOME[ctx.dayElement],
      avoidedElements: [ctx.dayElement, GENERATE[ctx.dayElement]],
      enemyElements: [],
      idleElements: [],
      explanation: '身强宜泄宜克，喜食伤财官。',
    }
  } else if (ctx.strengthScore <= 35) {
    return {
      bestElement: GENERATE[ctx.dayElement],
      usageElement: ctx.dayElement,
      avoidedElements: [OVERCOME[ctx.dayElement]],
      enemyElements: [],
      idleElements: [],
      explanation: '身弱宜生宜扶，喜印比帮身。',
    }
  }

  // 中和
  return {
    bestElement: GENERATE[ctx.dayElement],
    avoidedElements: [],
    enemyElements: [],
    idleElements: [],
    explanation: '中和之局，顺势而为。',
  }
}

/**
 * 判断是否有调候需要
 */
export function hasTiaoHouNeed(monthZhi: string): boolean {
  // 亥子月，水冷木凋，喜火
  if (monthZhi === '亥' || monthZhi === '子') {
    return true
  }
  // 巳午月，火炎土焦，喜水
  if (monthZhi === '巳' || monthZhi === '午') {
    return true
  }
  return false
}

/**
 * 判断是否有病药
 */
export function hasBingYaoNeed(strengthScore: number, geJuName: string): boolean {
  // 从格或专旺格无病药
  if (geJuName.includes('从') || geJuName.includes('专旺')) {
    return false
  }

  // 身太旺或太弱皆为病
  return strengthScore > 80 || strengthScore < 20
}
