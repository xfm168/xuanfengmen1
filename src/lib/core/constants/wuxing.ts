/**
 * 五行生克常量（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/rules/wuxingRules.ts:78  WANG_SHUAI_TABLE
 * - bazi/rules/wuxingRules.ts:86  GENERATE
 * - bazi/rules/wuxingRules.ts:90  OVERCOME
 * - bazi/rules/shishenRules.ts:89  GENERATE
 * - bazi/rules/shishenRules.ts:93  OVERCOME
 * - bazi/rules/xiyongRules.ts:50   GENERATE
 * - bazi/rules/xiyongRules.ts:54   OVERCOME
 * - bazi/rules/gejuRules.ts:134    GENERATE
 * - bazi/rules/gejuRules.ts:138    OVERCOME
 * - bazi/rules/gejuRules.ts:143    BE_OVERCOME
 * - bazi/rules/gejuRules.ts:148    BE_GENERATE
 * - bazi/wuxing.ts:31             WANG_SHUAI
 */

import type { FiveElement, WuXingWangShuai } from '../types/base'

// ─── 五行列表 ───

export const FIVE_ELEMENTS: FiveElement[] = ['木', '火', '土', '金', '水']

// ─── 五行相生（木→火→土→金→水→木）───

export const GENERATE: Record<FiveElement, FiveElement> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
}

// ─── 五行相克（木→土→水→火→金→木）───

export const OVERCOME: Record<FiveElement, FiveElement> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
}

// ─── 克我者（官杀）：OVERCOME 的反向 ───

export const BE_OVERCOME: Record<FiveElement, FiveElement> = {
  木: '金', 火: '水', 土: '木', 金: '火', 水: '土',
}

// ─── 生我者（印星）：GENERATE 的反向 ───

export const BE_GENERATE: Record<FiveElement, FiveElement> = {
  木: '水', 火: '木', 土: '火', 金: '土', 水: '金',
}

// ─── 旺相休囚死表 ───
// 行=月令五行，列=日主五行

export const WANG_SHUAI_TABLE: Record<FiveElement, Record<FiveElement, WuXingWangShuai>> = {
  木: { 木: '旺', 火: '相', 土: '死', 金: '囚', 水: '休' },
  火: { 木: '休', 火: '旺', 土: '相', 金: '死', 水: '囚' },
  土: { 木: '死', 火: '囚', 土: '旺', 金: '相', 水: '休' },
  金: { 木: '囚', 火: '休', 土: '死', 金: '旺', 水: '相' },
  水: { 木: '相', 火: '死', 土: '囚', 金: '休', 水: '旺' },
}

// ─── 旺相休囚死别名（兼容旧代码）───

export const WANG_SHUAI = WANG_SHUAI_TABLE
