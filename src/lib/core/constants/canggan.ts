/**
 * 藏干表常量（Single Source of Truth）
 *
 * 重复定义历史位置（全部已废弃，改引此文件）：
 * - bazi/calculator.ts:45      CANG_GAN
 * - bazi/wuxing.ts:84          CANG_GAN_TABLE
 * - bazi/rules/gejuRules.ts:4333  BRANCH_CANG_GAN
 */

import type { EarthlyBranch, HeavenlyStem } from '../types/base'

// ─── 藏干类型 ───

export interface CangGan {
  /** 本气 */
  ben: HeavenlyStem
  /** 中气 */
  zhong: HeavenlyStem | null
  /** 余气 */
  yao: HeavenlyStem | null
}

// ─── 藏干表 ───

export const CANG_GAN: Record<EarthlyBranch, CangGan> = {
  子: { ben: '癸', zhong: null, yao: null },
  丑: { ben: '己', zhong: '辛', yao: '癸' },
  寅: { ben: '甲', zhong: '丙', yao: '戊' },
  卯: { ben: '乙', zhong: null, yao: null },
  辰: { ben: '戊', zhong: '乙', yao: '癸' },
  巳: { ben: '丙', zhong: '庚', yao: '戊' },
  午: { ben: '丁', zhong: '己', yao: null },
  未: { ben: '己', zhong: '丁', yao: '乙' },
  申: { ben: '庚', zhong: '壬', yao: '戊' },
  酉: { ben: '辛', zhong: null, yao: null },
  戌: { ben: '戊', zhong: '辛', yao: '丁' },
  亥: { ben: '壬', zhong: '甲', yao: null },
}

// ─── 藏干列表形式（兼容 gejuRules 的 BRANCH_CANG_GAN）───

export const BRANCH_CANG_GAN: Record<EarthlyBranch, HeavenlyStem[]> = {
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
