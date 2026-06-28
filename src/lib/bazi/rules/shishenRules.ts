/**
 * 十神规则
 * 日主对其他天干的十神关系计算
 */

import type { ShenShi } from '../types'

// 天干五行
const GAN_ELEMENT: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

// 天干阴阳
const GAN_YINYANG: Record<string, '阳' | '阴'> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
}

// 十神关系（五行同类为比劫，异类按生克分）
// 我克者为财（同性为偏，异性为正）
// 克我者为官杀（同性为偏，异性为正）
// 我生者为食伤（同性为食，异性为伤）
// 生我者为印枭（同性为枭，异性为印）

export interface ShenShiContext {
  dayGan: string           // 日主天干
  targetGan: string        // 目标天干
  dayElement: string       // 日主五行
  targetElement: string    // 目标五行
}

export interface ShenShiRule {
  id: string
  priority: number
  condition: (ctx: ShenShiContext) => boolean
  result: ShenShi
  explanation: string
}

/**
 * 计算十神关系
 */
export function calculateShenShi(dayGan: string, targetGan: string): ShenShi {
  const dayElement = GAN_ELEMENT[dayGan]
  const targetElement = GAN_ELEMENT[targetGan]
  const dayYinYang = GAN_YINYANG[dayGan]
  const targetYinYang = GAN_YINYANG[targetGan]

  // 同性还是异性
  const sameYinYang = dayYinYang === targetYinYang

  // 五行生克关系
  const GENERATE: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
  }
  const OVERCOME: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
  }

  if (dayElement === targetElement) {
    // 同五行：比肩或劫财
    return sameYinYang ? '比肩' : '劫财'
  }

  if (GENERATE[dayElement] === targetElement) {
    // 我生者：食神或伤官
    return sameYinYang ? '食神' : '伤官'
  }

  if (OVERCOME[dayElement] === targetElement) {
    // 我克者：偏财或正财
    return sameYinYang ? '偏财' : '正财'
  }

  if (OVERCOME[targetElement] === dayElement) {
    // 克我者：七杀或正官
    return sameYinYang ? '偏官' : '正官'
  }

  if (GENERATE[targetElement] === dayElement) {
    // 生我者：偏印或正印
    return sameYinYang ? '偏印' : '正印'
  }

  // 默认（不应该发生）
  return '偏印'
}

/**
 * 十神规则列表
 */
export const SHISHEN_RULES: ShenShiRule[] = [
  // 劫财规则
  {
    id: 'jie-cai-yi-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '乙',
    result: '劫财',
    explanation: '甲木日主遇乙木，乙木为甲木之劫财',
  },
  {
    id: 'jie-cai-bing-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '丙' && ctx.targetGan === '丁',
    result: '劫财',
    explanation: '丙火日主遇丁火，丁火为丙火之劫财',
  },
  {
    id: 'jie-cai-wu-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '戊' && ctx.targetGan === '己',
    result: '劫财',
    explanation: '戊土日主遇己土，己土为戊土之劫财',
  },
  {
    id: 'jie-cai-geng-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '庚' && ctx.targetGan === '辛',
    result: '劫财',
    explanation: '庚金日主遇辛金，辛金为庚金之劫财',
  },
  {
    id: 'jie-cai-ren-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '壬' && ctx.targetGan === '癸',
    result: '劫财',
    explanation: '壬水日主遇癸水，癸水为壬水之劫财',
  },

  // 比肩规则
  {
    id: 'bi-jian-jia-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '甲',
    result: '比肩',
    explanation: '甲木日主遇甲木，比肩',
  },
  {
    id: 'bi-jian-bing-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '丙' && ctx.targetGan === '丙',
    result: '比肩',
    explanation: '丙火日主遇丙火，比肩',
  },
  {
    id: 'bi-jian-wu-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '戊' && ctx.targetGan === '戊',
    result: '比肩',
    explanation: '戊土日主遇戊土，比肩',
  },
  {
    id: 'bi-jian-geng-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '庚' && ctx.targetGan === '庚',
    result: '比肩',
    explanation: '庚金日主遇庚金，比肩',
  },
  {
    id: 'bi-jian-ren-yang',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '壬' && ctx.targetGan === '壬',
    result: '比肩',
    explanation: '壬水日主遇壬水，比肩',
  },

  // 正官规则
  {
    id: 'zheng-guan-jia-yi',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '辛',
    result: '正官',
    explanation: '甲木日主遇辛金，辛金为甲木之正官',
  },
  {
    id: 'zheng-guan-yi-geng',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '庚',
    result: '正官',
    explanation: '乙木日主遇庚金，庚金为乙木之正官',
  },

  // 七杀规则
  {
    id: 'qi-sha-jia-geng',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '庚',
    result: '偏官',
    explanation: '甲木日主遇庚金，庚金为甲木之七杀',
  },
  {
    id: 'qi-sha-yi-xin',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '辛',
    result: '偏官',
    explanation: '乙木日主遇辛金，辛金为乙木之七杀',
  },

  // 正印规则
  {
    id: 'zheng-yin-jia-ren',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '壬',
    result: '正印',
    explanation: '甲木日主遇壬水，壬水为甲木之正印',
  },
  {
    id: 'zheng-yin-yi-gui',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '癸',
    result: '正印',
    explanation: '乙木日主遇癸水，癸水为乙木之正印',
  },

  // 偏印规则
  {
    id: 'pian-yin-jia-gui',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '癸',
    result: '偏印',
    explanation: '甲木日主遇癸水，癸水为甲木之偏印',
  },
  {
    id: 'pian-yin-yi-ren',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '壬',
    result: '偏印',
    explanation: '乙木日主遇壬水，壬水为乙木之偏印',
  },

  // 食神规则
  {
    id: 'shi-shen-jia-bing',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '丙',
    result: '食神',
    explanation: '甲木日主遇丙火，丙火为甲木之食神',
  },
  {
    id: 'shi-shen-yi-ding',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '丁',
    result: '食神',
    explanation: '乙木日主遇丁火，丁火为乙木之食神',
  },

  // 伤官规则
  {
    id: 'shang-guan-jia-ding',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '丁',
    result: '伤官',
    explanation: '甲木日主遇丁火，丁火为甲木之伤官',
  },
  {
    id: 'shang-guan-yi-bing',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '丙',
    result: '伤官',
    explanation: '乙木日主遇丙火，丙火为乙木之伤官',
  },

  // 正财规则
  {
    id: 'zheng-cai-jia-ji',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '己',
    result: '正财',
    explanation: '甲木日主遇己土，己土为甲木之正财',
  },
  {
    id: 'zheng-cai-yi-wu',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '戊',
    result: '正财',
    explanation: '乙木日主遇戊土，戊土为乙木之正财',
  },

  // 偏财规则
  {
    id: 'pian-cai-jia-wu',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '甲' && ctx.targetGan === '戊',
    result: '偏财',
    explanation: '甲木日主遇戊土，戊土为甲木之偏财',
  },
  {
    id: 'pian-cai-yi-ji',
    priority: 10,
    condition: (ctx) => ctx.dayGan === '乙' && ctx.targetGan === '己',
    result: '偏财',
    explanation: '乙木日主遇己土，己土为乙木之偏财',
  },
]

/**
 * 应用十神规则
 */
export function applyShiShenRules(ctx: ShenShiContext): ShenShi {
  for (const rule of SHISHEN_RULES) {
    if (rule.condition(ctx)) {
      return rule.result
    }
  }

  // 默认计算
  return calculateShenShi(ctx.dayGan, ctx.targetGan)
}

/**
 * 获取日主对所有天干的十神关系
 */
export function getAllShenShi(dayGan: string): Record<string, ShenShi> {
  const allGans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const result: Record<string, ShenShi> = {}

  for (const gan of allGans) {
    result[gan] = calculateShenShi(dayGan, gan)
  }

  return result
}
