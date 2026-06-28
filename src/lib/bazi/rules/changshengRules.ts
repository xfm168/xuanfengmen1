/**
 * 十二长生规则
 * 阳干顺行、阴干逆行，各天干长生宫位
 */

import type { ShiErChangSheng } from '../types'

// 十二长生顺序
export const CHANG_SHENG_ORDER: ShiErChangSheng[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺',
  '衰', '病', '死', '墓', '绝', '胎', '养'
]

// 天干序号：甲0 乙1 丙2 丁3 戊4 己5 庚6 辛7 壬8 癸9
// 阳干：甲丙戊庚壬（序号0,2,4,6,8）
// 阴干：乙丁己辛癸（序号1,3,5,7,9）

// 各天干长生宫位（地支序号：0=寅 1=卯 2=辰 3=巳 4=午 5=未 6=申 7=酉 8=戌 9=亥 10=子 11=丑）
export const CHANG_SHENG_START: Record<number, number> = {
  0: 9,   // 甲长生亥（9=亥）
  1: 5,   // 乙长生午（5=午）
  2: 1,   // 丙长生寅（1=卯）... 等等，丙火长生在寅，应该是0=寅
  3: 9,   // 丁长生酉（9=亥）... 丁火长生在酉，应该是7=酉
  4: 9,   // 戊长生申（9=亥）... 戊土长生在申，应该是8=戌
  5: 9,   // 己长生酉（9=亥）... 己土长生在酉，应该是7=酉
  6: 5,   // 庚长生巳（5=午）... 庚金长生在巳，应该是3=巳
  7: 10,  // 辛长生子（10=子）
  8: 8,   // 壬长生申（8=戌）... 壬水长生在申，应该是6=申
  9: 2,   // 癸长生卯（2=辰）... 癸水长生在卯，应该是1=卯
}

// 更正后的长生宫位（基于传统命理）
// 甲木长生亥，乙木长生午
// 丙火长生寅，丁火长生酉
// 戊土长生申，己土长生酉
// 庚金长生巳，辛金长生子
// 壬水长生申，癸水长生卯
export const CHANG_SHENG_START_CORRECTED: Record<number, number> = {
  0: 9,   // 甲长生亥
  1: 5,   // 乙长生午
  2: 0,   // 丙长生寅
  3: 7,   // 丁长生酉
  4: 8,   // 戊长生申
  5: 7,   // 己长生酉（部分派别认为长生申，这里采用酉）
  6: 3,   // 庚长生巳
  7: 10,  // 辛长生子
  8: 6,   // 壬长生申
  9: 1,   // 癸长生卯
}

export interface ChangShengContext {
  gan: string                    // 天干
  ganIndex: number              // 天干序号 0-9
  zhi: string                   // 地支
  zhiIndex: number              // 地支序号 0-11
  isYang: boolean               // 是否阳干
}

export interface ChangShengRule {
  id: string
  priority: number
  condition: (ctx: ChangShengContext) => boolean
  result: ShiErChangSheng
  explanation: string
}

/**
 * 计算十二长生
 * 阳干顺行十二宫，阴干逆行十二宫
 */
export function calculateChangSheng(ganIndex: number, zhiIndex: number): ShiErChangSheng {
  const isYang = ganIndex % 2 === 0 // 0,2,4,6,8 = 阳干
  const startIndex = CHANG_SHENG_START_CORRECTED[ganIndex]

  let position: number
  if (isYang) {
    // 阳干顺行：从长生到胎养
    position = (zhiIndex - startIndex + 12) % 12
  } else {
    // 阴干逆行：从长生到养
    position = (startIndex - zhiIndex + 12) % 12
  }

  return CHANG_SHENG_ORDER[position]
}

/**
 * 十二长生规则列表（用于验证）
 */
export const CHANG_SHENG_RULES: ChangShengRule[] = [
  // 甲木
  {
    id: 'jia-mu-changsheng-hai',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '亥',
    result: '长生',
    explanation: '甲木长生在亥',
  },
  {
    id: 'jia-mu-muyu-zi',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '子',
    result: '沐浴',
    explanation: '甲木沐浴在子',
  },
  {
    id: 'jia-mu-guandai-chou',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '丑',
    result: '冠带',
    explanation: '甲木冠带在丑',
  },
  {
    id: 'jia-mu-linguan-yin',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '寅',
    result: '临官',
    explanation: '甲木临官在寅',
  },
  {
    id: 'jia-mu-diwang-mao',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '卯',
    result: '帝旺',
    explanation: '甲木帝旺在卯',
  },
  {
    id: 'jia-mu-shuai-chen',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '辰',
    result: '衰',
    explanation: '甲木衰在辰',
  },
  {
    id: 'jia-mu-bing-si',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '巳',
    result: '病',
    explanation: '甲木病在巳',
  },
  {
    id: 'jia-mu-si-wu',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '午',
    result: '死',
    explanation: '甲木死在午',
  },
  {
    id: 'jia-mu-mu-wei',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '未',
    result: '墓',
    explanation: '甲木墓在未',
  },
  {
    id: 'jia-mu-jue-shen',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '申',
    result: '绝',
    explanation: '甲木绝在申',
  },
  {
    id: 'jia-mu-tai-you',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '酉',
    result: '胎',
    explanation: '甲木胎在酉',
  },
  {
    id: 'jia-mu-yang-xu',
    priority: 10,
    condition: (ctx) => ctx.gan === '甲' && ctx.zhi === '戌',
    result: '养',
    explanation: '甲木养在戌',
  },

  // 乙木
  {
    id: 'yi-mu-changsheng-wu',
    priority: 10,
    condition: (ctx) => ctx.gan === '乙' && ctx.zhi === '午',
    result: '长生',
    explanation: '乙木长生在午',
  },

  // 丙火
  {
    id: 'bing-huo-changsheng-yin',
    priority: 10,
    condition: (ctx) => ctx.gan === '丙' && ctx.zhi === '寅',
    result: '长生',
    explanation: '丙火长生在寅',
  },

  // 丁火
  {
    id: 'ding-huo-changsheng-you',
    priority: 10,
    condition: (ctx) => ctx.gan === '丁' && ctx.zhi === '酉',
    result: '长生',
    explanation: '丁火长生在酉',
  },

  // 庚金
  {
    id: 'geng-jin-changsheng-si',
    priority: 10,
    condition: (ctx) => ctx.gan === '庚' && ctx.zhi === '巳',
    result: '长生',
    explanation: '庚金长生在巳',
  },

  // 辛金
  {
    id: 'xin-jin-changsheng-zi',
    priority: 10,
    condition: (ctx) => ctx.gan === '辛' && ctx.zhi === '子',
    result: '长生',
    explanation: '辛金长生在子',
  },

  // 壬水
  {
    id: 'ren-shui-changsheng-shen',
    priority: 10,
    condition: (ctx) => ctx.gan === '壬' && ctx.zhi === '申',
    result: '长生',
    explanation: '壬水长生在申',
  },

  // 癸水
  {
    id: 'gui-shui-changsheng-mao',
    priority: 10,
    condition: (ctx) => ctx.gan === '癸' && ctx.zhi === '卯',
    result: '长生',
    explanation: '癸水长生在卯',
  },
]

/**
 * 应用十二长生规则
 */
export function applyChangShengRules(ctx: ChangShengContext): ShiErChangSheng {
  for (const rule of CHANG_SHENG_RULES) {
    if (rule.condition(ctx)) {
      return rule.result
    }
  }

  // 默认计算
  return calculateChangSheng(ctx.ganIndex, ctx.zhiIndex)
}
