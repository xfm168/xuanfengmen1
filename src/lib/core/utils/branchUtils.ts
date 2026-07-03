/**
 * 地支工具函数（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/rules/wuxingRules.ts:100  getZhiElement
 * - bazi/wuxing.ts:59              getMonthMainElement
 */

import type { EarthlyBranch, FiveElement } from '../types/base'
import { EARTHLY_BRANCHES, BRANCH_ELEMENT, MONTH_BRANCHES } from '../constants/branch'

// ─── 查询函数 ───

/** 获取地支的五行属性 */
export function getBranchElement(branch: EarthlyBranch): FiveElement {
  return BRANCH_ELEMENT[branch]
}

/** 获取地支索引（0-11, 子=0） */
export function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch)
}

/** 根据索引获取地支 */
export function getBranchByIndex(index: number): EarthlyBranch {
  return EARTHLY_BRANCHES[((index % 12) + 12) % 12]
}

/** 获取月支索引（寅=0, 卯=1, ... 丑=11） */
export function getMonthBranchIndex(branch: EarthlyBranch): number {
  return MONTH_BRANCHES.indexOf(branch)
}

/** 获取某月支的主气五行 */
export function getMonthMainElement(monthZhi: EarthlyBranch): FiveElement {
  return BRANCH_ELEMENT[monthZhi]
}

// ─── 别名（兼容旧代码）───

/** @deprecated 使用 getBranchElement 代替 */
export const getZhiElement = getBranchElement
