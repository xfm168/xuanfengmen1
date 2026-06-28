/**
 * 大运规则
 * 起运规则、运程计算
 */

import type { FiveElement, GanZhi } from '../types'

export interface DaYunContext {
  birthDate: Date              // 出生日期
  gender: 'male' | 'female'    // 性别
  dayGan: string              // 日干
  dayElement: FiveElement     // 日主五行
  dayYinYang: '阳' | '阴'     // 日干阴阳
  monthZhi: string            // 月支
  strengthScore: number        // 身强身弱
  isLiChunPassed: boolean      // 立春是否已过
}

export interface DaYunResult {
  startAge: number              // 起运年龄
  startYear: number             // 起运年份
  ganZhi: GanZhi               // 大运干支
  element: FiveElement          // 大运五行
  nian: number                  // 出生年到起运年的年数差
}

// 大运计算规则
// 阳男阴女顺行，阴男阳女逆行
// 起运数 = (出生日到节令的天数) / 3 * 10 （约数）

/**
 * 计算大运起运年龄
 * 规则：
 * - 阳男（甲丙戊庚壬年出生）阴女逆行
 * - 阴男（乙丁己辛癸年出生）阳女顺行
 * - 精确起运：按出生日到下一个节令的天数计算
 */
export function calculateDaYunStart(ctx: DaYunContext): { startAge: number; daysToNextTerm: number } {
  // 简化计算：按3天折算1年
  // 精确计算应该按出生日到下一个节令的实际天数

  const baseAge = 8 // 默认8岁起运

  // 身强身弱调整
  if (ctx.strengthScore > 80) {
    return { startAge: baseAge - 2, daysToNextTerm: 0 }
  }
  if (ctx.strengthScore < 20) {
    return { startAge: baseAge + 2, daysToNextTerm: 0 }
  }

  return { startAge: baseAge, daysToNextTerm: 0 }
}

/**
 * 判断大运顺逆
 */
export function isShun(_startYear: number, gender: 'male' | 'female', dayYinYang: '阳' | '阴'): boolean {
  if (gender === 'male') {
    // 男命阳顺阴逆
    return dayYinYang === '阳'
  } else {
    // 女命阴顺阳逆
    return dayYinYang === '阴'
  }
}

/**
 * 生成大运序列
 */
export function generateDaYunSequence(
  startAge: number,
  startYear: number,
  birthYear: number,
  _dayGan: string,
  gender: 'male' | 'female',
  dayYinYang: '阳' | '阴',
  count: number = 10
): DaYunResult[] {
  const shun = isShun(startYear, gender, dayYinYang)

  // 五虎遁起运表（简化版）
  // 实际大运干支由月干支推算

  const results: DaYunResult[] = []
  let age = startAge
  let year = startYear

  // 大运干支计算（简化）
  // 从月柱开始，顺行或逆行

  const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

  // 月柱索引（假设从月干支推算）
  let currentStemIndex = 0
  let currentBranchIndex = 0

  for (let i = 0; i < count; i++) {
    const stem = HEAVENLY_STEMS[currentStemIndex]
    const branch = EARTHLY_BRANCHES[currentBranchIndex]

    results.push({
      startAge: age + i * 10,
      startYear: year + i * 10,
      ganZhi: { gan: stem as any, zhi: branch as any, element: '土' as any, yinYang: '阳' as any, naYin: '' },
      element: '土',
      nian: year + i * 10 - birthYear,
    })

    if (shun) {
      currentStemIndex = (currentStemIndex + 1) % 10
      currentBranchIndex = (currentBranchIndex + 1) % 12
    } else {
      currentStemIndex = (currentStemIndex - 1 + 10) % 10
      currentBranchIndex = (currentBranchIndex - 1 + 12) % 12
    }
  }

  return results
}

export interface DaYunRule {
  id: string
  priority: number
  condition: (ctx: DaYunContext) => boolean
  result: {
    startAge: number
    shunNi: '顺' | '逆'
    explanation: string
  }
}

/**
 * 大运规则列表
 */
export const DAYUN_RULES: DaYunRule[] = [
  // 身强从旺格
  {
    id: 'shenqiang-cong',
    priority: 20,
    condition: (ctx) => ctx.strengthScore > 85,
    result: {
      startAge: 6,
      shunNi: '顺',
      explanation: '身强从旺格，宜顺其势，早年起运。',
    },
  },
  // 身弱从格
  {
    id: 'shenruo-cong',
    priority: 20,
    condition: (ctx) => ctx.strengthScore < 20,
    result: {
      startAge: 10,
      shunNi: '逆',
      explanation: '身弱从格，起运较晚。',
    },
  },
  // 中和之命
  {
    id: 'zhonghe',
    priority: 10,
    condition: (ctx) => ctx.strengthScore >= 40 && ctx.strengthScore <= 60,
    result: {
      startAge: 8,
      shunNi: '顺',
      explanation: '中和之命，平顺之运。',
    },
  },
  // 默认
  {
    id: 'default',
    priority: 1,
    condition: () => true,
    result: {
      startAge: 8,
      shunNi: '顺',
      explanation: '普通起运年龄。',
    },
  },
]

/**
 * 应用大运规则
 */
export function applyDaYunRules(ctx: DaYunContext): DaYunRule['result'] {
  for (const rule of DAYUN_RULES) {
    if (rule.condition(ctx)) {
      return rule.result
    }
  }
  return DAYUN_RULES[DAYUN_RULES.length - 1].result
}
