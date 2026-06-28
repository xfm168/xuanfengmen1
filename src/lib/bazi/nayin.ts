/**
 * 纳音六十甲子
 * 六十甲子对应纳音五行表
 */

import type { HeavenlyStem, EarthlyBranch, NaYin } from './types'

export type { NaYin }

// 天干索引
const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支索引
const BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 纳音六十甲子表（按六十甲子顺序排列）
const NA_YIN_TABLE: NaYin[] = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
  '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
  '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
  '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
  '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木',
  '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
  '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金',
  '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
  '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
]

/**
 * 根据干支序号计算六十甲子索引
 * @param ganIdx 天干序号 (0-9)
 * @param zhiIdx 地支序号 (0-11)
 * @returns 六十甲子序号 (0-59)
 */
function ganzhiIndex(ganIdx: number, zhiIdx: number): number {
  // 六十甲子序号 = 天干 + 10*k，其中k使 (zhiIdx - ganIdx - 10*k) % 12 === 0
  // 简化：直接查表法
  for (let n = 0; n < 60; n++) {
    if (n % 10 === ganIdx && n % 12 === zhiIdx) {
      return n
    }
  }
  return 0
}

/**
 * 获取指定干支的纳音
 * @param gan 天干
 * @param zhi 地支
 * @returns 纳音名称
 */
export function getNaYin(gan: HeavenlyStem, zhi: EarthlyBranch): NaYin {
  const ganIdx = STEMS.indexOf(gan)
  const zhiIdx = BRANCHES.indexOf(zhi)
  const idx = ganzhiIndex(ganIdx, zhiIdx)
  return NA_YIN_TABLE[idx] || '未知'
}

/**
 * 获取指定序号的纳音
 * @param index 六十甲子序号 (0-59)
 * @returns 纳音名称
 */
export function getNaYinByIndex(index: number): NaYin {
  return NA_YIN_TABLE[((index % 60) + 60) % 60] || '未知'
}

/**
 * 获取六十甲子表（完整）
 */
export function getNaYinTable(): readonly NaYin[] {
  return NA_YIN_TABLE
}
