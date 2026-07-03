/**
 * 五行工具函数（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/wuxing.ts:66       getWangShuai
 * - bazi/rules/xiyongRules.ts:56  getMotherElement
 * - bazi/rules/xiyongRules.ts:58  allElementsExcept
 * - bazi/rules/gejuRules.ts:147  getElement / getYinYang
 */

import type { FiveElement, WuXingWangShuai } from '../types/base'
import {
  GENERATE, OVERCOME, BE_OVERCOME, BE_GENERATE,
  WANG_SHUAI_TABLE, FIVE_ELEMENTS,
} from '../constants/wuxing'

// ─── 生克关系 ───

/** 获取相生关系：A 生谁 */
export function getGenerated(element: FiveElement): FiveElement {
  return GENERATE[element]
}

/** 获取相克关系：A 克谁 */
export function getOvercame(element: FiveElement): FiveElement {
  return OVERCOME[element]
}

/** 获取克我者：谁克 A（官杀） */
export function getOvercomer(element: FiveElement): FiveElement {
  return BE_OVERCOME[element]
}

/** 获取生我者：谁生 A（印星） */
export function getGenerator(element: FiveElement): FiveElement {
  return BE_GENERATE[element]
}

// ─── 旺衰 ───

/** 获取五行旺相休囚死 */
export function getWangShuai(
  monthElement: FiveElement,
  dayElement: FiveElement,
): WuXingWangShuai {
  return WANG_SHUAI_TABLE[monthElement][dayElement]
}

// ─── 辅助 ───

/** 获取生我者（印星） */
export function getMotherElement(element: FiveElement): FiveElement {
  return BE_GENERATE[element]
}

/** 获取除指定五行外的所有五行 */
export function allElementsExcept(element: FiveElement): FiveElement[] {
  return FIVE_ELEMENTS.filter((e) => e !== element)
}

/** 判断两个五行是否相同 */
export function isSameElement(a: FiveElement, b: FiveElement): boolean {
  return a === b
}

/** 判断 A 是否生 B */
export function isGenerating(a: FiveElement, b: FiveElement): boolean {
  return GENERATE[a] === b
}

/** 判断 A 是否克 B */
export function isOvercoming(a: FiveElement, b: FiveElement): boolean {
  return OVERCOME[a] === b
}
