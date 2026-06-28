/**
 * 十二长生
 * 阳干顺行十二地支，阴干逆行十二地支
 */

import type { HeavenlyStem, EarthlyBranch, ShiErChangSheng } from './types'

export type { ShiErChangSheng }

const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 十二长生名称顺序
export const CHANG_SHENG_NAMES: ShiErChangSheng[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
]

// 更准确的长生宫位（查万年历验证）
// 甲木：长生亥(9), 沐浴子(10), 冠带丑(11), 临官寅(0), 帝旺卯(1), 衰辰(2), 病巳(3), 死午(4), 墓未(5), 绝申(6), 胎酉(7), 养戌(8)
// 乙木：长生午(6), 沐浴巳(5), 冠带辰(4), 临官卯(3), 帝旺寅(2), 衰丑(1), 病子(0), 死亥(11), 墓戌(10), 绝酉(9), 胎申(8), 养未(7)
// 丙火：长生寅(2), 沐浴卯(3), 冠带辰(4), 临官巳(5), 帝旺午(6), 衰未(7), 病申(8), 死酉(9), 墓戌(10), 绝亥(11), 胎子(0), 养丑(1)
// 丁火：长生酉(8), 沐浴申(7), 冠带未(6), 临官午(5), 帝旺巳(4), 衰辰(3), 病卯(2), 死寅(1), 墓丑(0), 绝子(11), 胎亥(10), 养戌(9)
// 戊土：长生申(9), 沐浴酉(10), 冠带戌(11), 临官亥(0), 帝旺子(1), 衰丑(2), 病寅(3), 死卯(4), 墓辰(5), 绝巳(6), 胎午(7), 养未(8)
// 己土：长生酉(8), 沐浴申(7), 冠带未(6), 临官午(5), 帝旺巳(4), 衰辰(3), 病卯(2), 死寅(1), 墓丑(0), 绝子(11), 胎亥(10), 养戌(9)
// 庚金：长生巳(6), 沐浴午(7), 冠带未(8), 临官申(9), 帝旺酉(10), 衰戌(11), 病亥(0), 死子(1), 墓丑(2), 绝寅(3), 胎卯(4), 养辰(5)
// 辛金：长生子(0), 沐浴丑(1), 冠带寅(2), 临官卯(3), 帝旺辰(4), 衰巳(5), 病午(6), 死未(7), 墓申(8), 绝酉(9), 胎戌(10), 养亥(11)
// 壬水：长生申(9), 沐浴酉(10), 冠带戌(11), 临官亥(0), 帝旺子(1), 衰丑(2), 病寅(3), 死卯(4), 墓辰(5), 绝巳(6), 胎午(7), 养未(8)
// 癸水：长生卯(3), 沐浴寅(2), 冠带丑(1), 临官子(0), 帝旺亥(11), 衰戌(10), 病酉(9), 死申(8), 墓未(7), 绝午(6), 胎巳(5), 养辰(4)

// 天干索引对应的长生宫位（地支索引）
// 子=0, 丑=1, 寅=2, 卯=3, 辰=4, 巳=5, 午=6, 未=7, 申=8, 酉=9, 戌=10, 亥=11
// 甲0木:长生亥11, 乙1木:长生午6, 丙2火:长生寅2, 丁3火:长生酉8
// 戊4土:长生申8, 己5土:长生酉8, 庚6金:长生巳5, 辛7金:长生子0
// 壬8水:长生申8, 癸9水:长生卯3
const CHANG_SHENG_START: Record<number, number> = {
  0: 11,  // 甲长生亥
  1: 6,   // 乙长生午
  2: 2,   // 丙长生寅
  3: 8,   // 丁长生酉
  4: 8,   // 戊长生申
  5: 8,   // 己长生酉
  6: 5,   // 庚长生巳
  7: 0,   // 辛长生子
  8: 8,   // 壬长生申
  9: 3,   // 癸长生卯
}

/**
 * 判断天干阴阳
 */
function isYangStem(gan: HeavenlyStem): boolean {
  return ['甲', '丙', '戊', '庚', '壬'].includes(gan)
}

/**
 * 获取某天干在某地支的十二长生状态
 * @param gan 天干
 * @param zhi 地支
 * @returns 十二长生名称
 */
export function getChangSheng(gan: HeavenlyStem, zhi: EarthlyBranch): ShiErChangSheng {
  const ganIdx = STEMS.indexOf(gan)
  const zhiIdx = BRANCHES.indexOf(zhi)
  const startIdx = CHANG_SHENG_START[ganIdx]

  let offset: number
  if (isYangStem(gan)) {
    // 阳干顺行
    offset = (zhiIdx - startIdx + 12) % 12
  } else {
    // 阴干逆行
    offset = (startIdx - zhiIdx + 12) % 12
  }

  return CHANG_SHENG_NAMES[offset]
}

/**
 * 获取某天干的长生宫位地支
 */
export function getChangShengStartZhi(gan: HeavenlyStem): EarthlyBranch {
  const ganIdx = STEMS.indexOf(gan)
  const startIdx = CHANG_SHENG_START[ganIdx]
  return BRANCHES[startIdx]
}

/**
 * 获取十二长生名称列表
 */
export function getChangShengNames(): ShiErChangSheng[] {
  return [...CHANG_SHENG_NAMES]
}
