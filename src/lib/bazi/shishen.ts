/**
 * 十神计算
 * 基于五行生克关系和阴阳同异判断
 */

import type { HeavenlyStem, ShenShi, FiveElement } from './types'

export type { ShenShi }

// 天干
const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 天干五行
const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

// 天干阴阳
const STEM_YINYANG: Record<HeavenlyStem, '阳' | '阴'> = {
  甲: '阳', 丙: '阳', 戊: '阳', 庚: '阳', 壬: '阳',
  乙: '阴', 丁: '阴', 己: '阴', 辛: '阴', 癸: '阴',
}

// 五行相生
const GENERATE: Record<FiveElement, FiveElement> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
}

// 五行相克
const OVERCOME: Record<FiveElement, FiveElement> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
}

/**
 * 计算两个天干之间的十神关系
 * @param dayGan 日主天干
 * @param targetGan 目标天干
 * @returns 十神名称
 */
export function calculateShenShi(dayGan: HeavenlyStem, targetGan: HeavenlyStem): ShenShi {
  const dayElement = STEM_ELEMENT[dayGan]
  const dayYinYang = STEM_YINYANG[dayGan]
  const targetElement = STEM_ELEMENT[targetGan]
  const targetYinYang = STEM_YINYANG[targetGan]

  const sameYinYang = dayYinYang === targetYinYang

  // 同我者（比和）
  if (targetElement === dayElement) {
    return sameYinYang ? '比肩' : '劫财'
  }

  // 我生者（泄气）
  if (GENERATE[dayElement] === targetElement) {
    return sameYinYang ? '食神' : '伤官'
  }

  // 我克者（财）
  if (OVERCOME[dayElement] === targetElement) {
    return sameYinYang ? '偏财' : '正财'
  }

  // 克我者（官杀）
  if (OVERCOME[targetElement] === dayElement) {
    return sameYinYang ? '偏官' : '正官'
  }

  // 生我者（印）
  if (GENERATE[targetElement] === dayElement) {
    return sameYinYang ? '偏印' : '正印'
  }

  // 理论上不会到这里
  return '比肩'
}

/**
 * 获取日主天干对应的所有十神关系
 * @param dayGan 日主天干
 * @returns 10个天干对应的十神
 */
export function getRelatedShens(dayGan: HeavenlyStem): Record<HeavenlyStem, ShenShi> {
  const result = {} as Record<HeavenlyStem, ShenShi>
  for (const stem of STEMS) {
    result[stem] = calculateShenShi(dayGan, stem)
  }
  return result
}

/**
 * 获取天干的五行属性
 */
export function getStemElement(gan: HeavenlyStem): FiveElement {
  return STEM_ELEMENT[gan]
}

/**
 * 获取天干的阴阳属性
 */
export function getStemYinYang(gan: HeavenlyStem): '阳' | '阴' {
  return STEM_YINYANG[gan]
}

/**
 * 获取所有天干列表
 */
export function getAllStems(): HeavenlyStem[] {
  return [...STEMS]
}
