/**
 * 十二长生常量（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/rules/changshengRules.ts:25  STEMS
 * - bazi/rules/changshengRules.ts:26  BRANCHES
 * - bazi/rules/changshengRules.ts:28  CHANG_SHENG_NAMES
 * - bazi/rules/changshengRules.ts:34  CHANG_SHENG_START
 * - bazi/rules/changshengRules.ts:40  GAN_YINYANG
 */

import type { HeavenlyStem, ShiErChangSheng } from '../types/base'

// ─── 十二长生名称 ───

export const CHANG_SHENG_NAMES: ShiErChangSheng[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
]

// ─── 各天干长生起点（地支索引 0=子, 1=丑, ... 11=亥）───

export const CHANG_SHENG_START: Record<HeavenlyStem, number> = {
  '甲': 11, '乙': 6, '丙': 2, '丁': 8, '戊': 8,
  '己': 8, '庚': 5, '辛': 0, '壬': 8, '癸': 3,
}
