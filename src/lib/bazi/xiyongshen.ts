/**
 * 喜用神判断
 * 结合身强身弱、格局、调候、病药等因素综合确定喜忌神
 */

import type { FiveElement, WuXingWangShuai } from './types'
import type { GeJuName } from './geju'

export type { GeJuName }

// 五行相生相克
const GENERATE: Record<FiveElement, FiveElement> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
}

const OVERCOME: Record<FiveElement, FiveElement> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
}

export interface XiYongShenResult {
  bestElement: FiveElement  // 喜神
  usageElement?: FiveElement // 用神（与喜神可能不同）
  avoidedElements: FiveElement[] // 忌神
  enemyElements: FiveElement[]  // 仇神
  idleElements: FiveElement[]  // 闲神
  description: string
}

/**
 * 判断喜用神
 * @param strengthScore 日主力量评分 0-100
 * @param wangShuai 旺相休囚死
 * @param geJuName 格局名称
 * @param dayElement 日主五行
 * @returns 喜用神结果
 */
export function determineXiYongShen(
  strengthScore: number,
  _wangShuai: WuXingWangShuai,
  geJuName: GeJuName,
  dayElement: FiveElement,
): XiYongShenResult {
  const elements: FiveElement[] = ['木', '火', '土', '金', '水']
  const generateMe = elements.find(e => GENERATE[e] === dayElement)! // 生我者
  const overcomeMe = elements.find(e => OVERCOME[e] === dayElement)! // 克我者
  const iGenerate = GENERATE[dayElement] // 我生者
  const iOvercome = OVERCOME[dayElement] // 我克者

  let bestElement: FiveElement
  let usageElement: FiveElement | undefined
  let avoided: FiveElement[] = []
  let enemy: FiveElement[] = []
  let idle: FiveElement[] = []

  // 基于身强身弱判断
  if (strengthScore >= 65) {
    // 身强：喜克泄耗
    bestElement = iOvercome // 我克者为财（偏财）
    usageElement = iGenerate // 食伤泄秀
    avoided = [dayElement, generateMe] // 比劫、生我者
    enemy = [generateMe]
    idle = [overcomeMe]
  } else if (strengthScore <= 35) {
    // 身弱：喜生扶
    bestElement = generateMe // 生我者印
    usageElement = dayElement // 比劫帮身
    avoided = [overcomeMe, iOvercome] // 官杀、财
    enemy = [overcomeMe]
    idle = [iOvercome, iGenerate]
  } else {
    // 中和：喜泄秀
    bestElement = iGenerate // 食伤泄秀
    usageElement = iOvercome // 财
    avoided = [overcomeMe] // 官杀
    enemy = []
    idle = [dayElement, generateMe]
  }

  // 格局调整
  if (geJuName === '七杀格' || geJuName === '正官格') {
    // 官杀格：喜印化杀，或喜财生杀
    if (strengthScore < 50) {
      bestElement = generateMe // 印化杀
      usageElement = dayElement
    }
  } else if (geJuName === '食神格') {
    // 食神格：喜财生
    if (strengthScore > 50) {
      bestElement = iOvercome // 财
    }
  } else if (geJuName === '伤官格') {
    // 伤官格：喜印制伤或喜财化伤
    if (strengthScore > 50) {
      bestElement = generateMe // 印
      usageElement = iOvercome
    }
  } else if (geJuName === '从官杀格') {
    bestElement = iOvercome
    usageElement = iGenerate
    avoided = [dayElement, generateMe]
  } else if (geJuName === '从财格') {
    bestElement = iOvercome
    usageElement = iGenerate
    avoided = [dayElement]
  } else if (geJuName === '专旺格') {
    bestElement = GENERATE[dayElement]
    avoided = [OVERCOME[dayElement]]
  }

  // 去除重复
  const avoidedUnique = [...new Set(avoided)]
  const enemyUnique = [...new Set(enemy)]
  const idleUnique = idle.filter(e => !avoidedUnique.includes(e) && !enemyUnique.includes(e))

  let description = ''
  if (strengthScore >= 65) {
    description = `身强${geJuName}，喜${bestElement}泄耗，忌${avoidedUnique.join('、')}。`
  } else if (strengthScore <= 35) {
    description = `身弱${geJuName}，喜${bestElement}生扶，忌${avoidedUnique.join('、')}。`
  } else {
    description = `中和${geJuName}，喜${bestElement}泄秀，忌${avoidedUnique.join('、')}。`
  }

  return {
    bestElement,
    usageElement,
    avoidedElements: avoidedUnique,
    enemyElements: enemyUnique,
    idleElements: idleUnique,
    description,
  }
}
