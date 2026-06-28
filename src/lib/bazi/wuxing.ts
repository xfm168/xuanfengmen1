/**
 * 五行旺衰计算
 * 基于月令权重、通根、透干等因素计算五行力量
 */

import type { FiveElement, GanZhi } from './types'
import type { WuXingWangShuai } from './types'

export type { WuXingWangShuai }

// 天干五行
const STEM_ELEMENT: Record<string, FiveElement> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

// 地支五行
const BRANCH_ELEMENT: Record<string, FiveElement> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
}

// 藏干权重
const CANG_GAN_WEIGHT: Record<string, { ben: number; zhong: number; yao: number }> = {
  子: { ben: 1.0, zhong: 0, yao: 0 },  // 子藏癸水
  丑: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 己辛癸
  寅: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 甲丙戊
  卯: { ben: 1.0, zhong: 0, yao: 0 },  // 卯藏乙木
  辰: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 戊乙癸
  巳: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 丙庚戊
  午: { ben: 0.7, zhong: 0.3, yao: 0 },  // 丁己
  未: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 己丁乙
  申: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 庚壬戊
  酉: { ben: 1.0, zhong: 0, yao: 0 },  // 酉藏辛金
  戌: { ben: 0.6, zhong: 0.3, yao: 0.1 }, // 戊辛丁
  亥: { ben: 0.7, zhong: 0.3, yao: 0 },  // 壬甲
}

// 地支藏干表
const CANG_GAN_TABLE: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '辛', '癸'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
}

// 月令旺相休囚死表（地支 → 该月令对各五行的旺衰）
// 表结构：key=地支五行, value=各五行的旺衰
const WANG_SHUAI: Record<FiveElement, Record<FiveElement, WuXingWangShuai>> = {
  木: {
    木: '旺', 火: '相', 土: '死', 金: '囚', 水: '休',
  },
  火: {
    木: '休', 火: '旺', 土: '相', 金: '死', 水: '囚',
  },
  土: {
    木: '死', 火: '囚', 土: '旺', 金: '相', 水: '休',
  },
  金: {
    木: '囚', 火: '休', 土: '死', 金: '旺', 水: '相',
  },
  水: {
    木: '相', 火: '死', 土: '囚', 金: '休', 水: '旺',
  },
}

// 旺相休囚死对应分数调整
const WANG_SHUAI_SCORE: Record<WuXingWangShuai, number> = {
  旺: 20,
  相: 10,
  休: 0,
  囚: -10,
  死: -20,
}

// 月支对应的五行（主气）
const BRANCH_MAIN_ELEMENT: Record<string, FiveElement> = {
  寅: '木', 卯: '木',
  巳: '火', 午: '火',
  申: '金', 酉: '金',
  亥: '水', 子: '水',
  辰: '土', 丑: '土', 未: '土', 戌: '土',
}

export interface FiveElementScore {
  element: FiveElement
  score: number
  fromStems: number    // 天干贡献
  fromBranches: number // 地支贡献
  fromCangGan: number  // 藏干贡献
  total: number
}

export interface StrengthResult {
  dayElement: FiveElement
  wangShuai: WuXingWangShuai
  strengthScore: number // 0-100
  scores: FiveElementScore[]
  analysis: string
}

/**
 * 计算某五行在地支中的权重
 */
function getBranchWeight(element: FiveElement, branch: string): number {
  const cangs = CANG_GAN_TABLE[branch] || []
  const weights = CANG_GAN_WEIGHT[branch] || { ben: 1.0, zhong: 0, yao: 0 }

  let total = 0
  let idx = 0
  for (const cang of cangs) {
    if (STEM_ELEMENT[cang] === element) {
      if (idx === 0) total += weights.ben
      else if (idx === 1) total += weights.zhong
      else total += weights.yao
    }
    idx++
  }
  return total
}

/**
 * 计算五行旺衰
 * @param sixLines 四柱干支
 * @param dayGan 日主天干
 * @param monthZhi 月支
 * @returns 旺衰结果
 */
export function calculateStrength(
  sixLines: { year: GanZhi; month: GanZhi; day: GanZhi; hour: GanZhi },
  dayGan: string,
  monthZhi: string,
): StrengthResult {
  const dayElement = STEM_ELEMENT[dayGan] as FiveElement
  const monthElement = BRANCH_MAIN_ELEMENT[monthZhi] as FiveElement
  const wangShuai = WANG_SHUAI[monthElement][dayElement]

  const elements: FiveElement[] = ['木', '火', '土', '金', '水']
  const scores: FiveElementScore[] = []

  let totalScore = 0

  for (const el of elements) {
    let fromStems = 0
    let fromBranches = 0
    let fromCangGan = 0

    // 天干贡献（每个天干1分）
    for (const pillar of [sixLines.year, sixLines.month, sixLines.day, sixLines.hour]) {
      if (STEM_ELEMENT[pillar.gan] === el) {
        fromStems += 1.0
      }
    }

    // 地支本气贡献
    if (BRANCH_ELEMENT[monthZhi] === el) {
      fromBranches += 0.5
    }

    // 地支藏干贡献
    const cangs = CANG_GAN_TABLE[monthZhi] || []
    const weights = CANG_GAN_WEIGHT[monthZhi] || { ben: 1.0, zhong: 0, yao: 0 }
    let idx = 0
    for (const cang of cangs) {
      if (STEM_ELEMENT[cang] === el) {
        if (idx === 0) fromCangGan += weights.ben * 0.5
        else if (idx === 1) fromCangGan += weights.zhong * 0.5
        else fromCangGan += weights.yao * 0.5
      }
      idx++
    }

    // 其他三柱的地支贡献
    for (const pillar of [sixLines.year, sixLines.month, sixLines.day, sixLines.hour]) {
      if (pillar.zhi !== monthZhi) {
        fromBranches += getBranchWeight(el, pillar.zhi) * 0.3
      }
    }

    const total = fromStems + fromBranches + fromCangGan
    scores.push({
      element: el,
      score: Math.round(total * 10) / 10,
      fromStems: Math.round(fromStems * 10) / 10,
      fromBranches: Math.round(fromBranches * 10) / 10,
      fromCangGan: Math.round(fromCangGan * 10) / 10,
      total,
    })

    if (el === dayElement) {
      totalScore += total
    }
  }

  // 计算日主得分（0-100）
  // 基准：日主占总分30%左右为中和
  const maxElement = Math.max(...scores.map(s => s.total))
  const dayScore = scores.find(s => s.element === dayElement)?.total || 0

  // 月令调整
  const monthBonus = WANG_SHUAI_SCORE[wangShuai]

  // 计算相对强度
  let strengthScore = 50 + monthBonus
  if (dayScore > maxElement * 0.5) {
    strengthScore += (dayScore / maxElement) * 20
  } else {
    strengthScore -= (maxElement * 0.5 - dayScore) * 10
  }

  strengthScore = Math.max(10, Math.min(90, Math.round(strengthScore)))

  let analysis = `${dayElement}日主，${monthZhi}月令${wangShuai}。`
  if (strengthScore >= 65) {
    analysis += `身强，宜克泄。`
  } else if (strengthScore <= 35) {
    analysis += `身弱，宜生扶。`
  } else {
    analysis += `中和，宜顺势。`
  }

  return {
    dayElement,
    wangShuai,
    strengthScore,
    scores,
    analysis,
  }
}

/**
 * 获取某月支的主气五行
 */
export function getMonthMainElement(monthZhi: string): FiveElement {
  return BRANCH_MAIN_ELEMENT[monthZhi] as FiveElement
}

/**
 * 获取五行旺相休囚死
 */
export function getWangShuai(monthElement: FiveElement, dayElement: FiveElement): WuXingWangShuai {
  return WANG_SHUAI[monthElement][dayElement]
}
