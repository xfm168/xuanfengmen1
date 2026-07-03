/**
 * 天干工具函数（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/shishen.ts:56       getStemElement
 * - bazi/shishen.ts:63       getStemYinYang
 * - bazi/rules/wuxingRules.ts:96   getGanElement
 * - bazi/rules/shishenRules.ts:110  getStemElement（内部别名）
 */

import type { HeavenlyStem, FiveElement, YinYang } from '../types/base'
import { STEM_ELEMENT, STEM_YINYANG, HEAVENLY_STEMS, YANG_STEMS } from '../constants/stem'

// ─── 查询函数 ───

/** 获取天干的五行属性 */
export function getStemElement(stem: HeavenlyStem): FiveElement {
  return STEM_ELEMENT[stem]
}

/** 获取天干的阴阳属性 */
export function getStemYinYang(stem: HeavenlyStem): YinYang {
  return STEM_YINYANG[stem]
}

/** 判断是否为阳干 */
export function isYangStem(stem: HeavenlyStem): boolean {
  return YANG_STEMS.includes(stem)
}

/** 判断是否为阴干 */
export function isYinStem(stem: HeavenlyStem): boolean {
  return !YANG_STEMS.includes(stem)
}

/** 获取天干索引（0-9） */
export function getStemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem)
}

/** 根据索引获取天干 */
export function getStemByIndex(index: number): HeavenlyStem {
  return HEAVENLY_STEMS[((index % 10) + 10) % 10]
}

// ─── 别名（兼容旧代码）───

/** @deprecated 使用 getStemElement 代替 */
export const getGanElement = getStemElement

/** @deprecated 使用 getStemElement 代替 */
export const getElement = getStemElement

/** @deprecated 使用 getStemElement 代替 */
export const getDayElement = getStemElement
