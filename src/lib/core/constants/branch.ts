/**
 * 地支常量（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/calculator.ts:40     EARTHLY_BRANCHES
 * - bazi/calculator.ts:42     MONTH_BRANCHES
 * - bazi/rules/wuxingRules.ts:72  BRANCH_ELEMENT
 * - bazi/rules/dashunRules.ts:8   EARTHLY_BRANCHES
 */

import type { EarthlyBranch, FiveElement } from '../types/base'

// ─── 地支列表 ───

export const EARTHLY_BRANCHES: EarthlyBranch[] = [
  '子', '丑', '寅', '卯', '辰',
  '巳', '午', '未', '申', '酉', '戌', '亥',
]

// ─── 月支顺序（寅为正月）───

export const MONTH_BRANCHES: EarthlyBranch[] = [
  '寅', '卯', '辰', '巳', '午', '未',
  '申', '酉', '戌', '亥', '子', '丑',
]

// ─── 地支五行属性 ───

export const BRANCH_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
}

// ─── 地支主气五行（与 BRANCH_ELEMENT 一致，保留别名）───

export const BRANCH_MAIN_ELEMENT: Record<EarthlyBranch, FiveElement> = BRANCH_ELEMENT

// ─── 地支阴阳属性 ───

export const BRANCH_YINYANG: Record<EarthlyBranch, '阳' | '阴'> = {
  子: '阳', 寅: '阳', 辰: '阳', 午: '阳', 申: '阳', 戌: '阳',
  丑: '阴', 卯: '阴', 巳: '阴', 未: '阴', 酉: '阴', 亥: '阴',
}

// ─── 地支生肖 ───

export const BRANCH_ZODIAC: Record<EarthlyBranch, string> = {
  子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔',
  辰: '龙', 巳: '蛇', 午: '马', 未: '羊',
  申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪',
}

// ─── 十二时辰（地支对应时辰）───

export const BRANCH_HOUR: Record<EarthlyBranch, [number, number]> = {
  子: [23, 1], 丑: [1, 3], 寅: [3, 5], 卯: [5, 7],
  辰: [7, 9], 巳: [9, 11], 午: [11, 13], 未: [13, 15],
  申: [15, 17], 酉: [17, 19], 戌: [19, 21], 亥: [21, 23],
}
