/**
 * 天干常量（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/calculator.ts:39  HEAVENLY_STEMS
 * - bazi/shishen.ts:18     STEMS
 * - bazi/shishen.ts:20     STEM_ELEMENT
 * - bazi/shishen.ts:28     STEM_YINYANG
 * - bazi/rules/wuxingRules.ts:59  STEM_ELEMENT
 * - bazi/rules/wuxingRules.ts:67  STEM_YINYANG
 * - bazi/rules/shishenRules.ts:76 STEM_ELEMENT
 * - bazi/rules/dashunRules.ts:7   HEAVENLY_STEMS
 */

import type { HeavenlyStem, FiveElement, YinYang } from '../types/base'

// ─── 天干列表 ───

export const HEAVENLY_STEMS: HeavenlyStem[] = [
  '甲', '乙', '丙', '丁', '戊',
  '己', '庚', '辛', '壬', '癸',
]

// ─── 天干五行属性 ───

export const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

// ─── 天干阴阳属性 ───

export const STEM_YINYANG: Record<HeavenlyStem, YinYang> = {
  甲: '阳', 丙: '阳', 戊: '阳', 庚: '阳', 壬: '阳',
  乙: '阴', 丁: '阴', 己: '阴', 辛: '阴', 癸: '阴',
}

// ─── 阳干列表 ───

export const YANG_STEMS: HeavenlyStem[] = ['甲', '丙', '戊', '庚', '壬']

// ─── 阴干列表 ───

export const YIN_STEMS: HeavenlyStem[] = ['乙', '丁', '己', '辛', '癸']
