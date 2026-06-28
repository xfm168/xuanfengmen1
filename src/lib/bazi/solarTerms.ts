/**
 * 真节气计算（天文算法）
 * 使用二分查找 + 太阳黄经精确计算二十四节气时刻
 * 参考：《中国天文年历》计算标准
 */

import type { SolarTermName } from './types'

export type { SolarTermName }

export interface SolarTermInfo {
  name: SolarTermName
  month: number
  day: number
  hour: number
  minute: number
}

// 二十四节气太阳黄经（度）
const SOLAR_TERM_DEGREES: Record<SolarTermName, number> = {
  小寒: 285,
  大寒: 300,
  立春: 315,
  雨水: 330,
  惊蛰: 345,
  春分: 0,
  清明: 15,
  谷雨: 30,
  立夏: 45,
  小满: 60,
  芒种: 75,
  夏至: 90,
  小暑: 105,
  大暑: 120,
  立秋: 135,
  处暑: 150,
  白露: 165,
  秋分: 180,
  寒露: 195,
  霜降: 210,
  立冬: 225,
  小雪: 240,
  大雪: 255,
  冬至: 270,
}

const SOLAR_TERM_NAMES: SolarTermName[] = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
]

/**
 * 计算太阳黄经（度）- Jean Meeus 算法
 */
function solarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0

  // 太阳平黄经
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T

  // 太阳平近点角
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T

  // 中心差
  const C = (1.914602 - 0.004817 * T) * Math.sin(M * Math.PI / 180)
    + 0.019993 * Math.sin(2 * M * Math.PI / 180)

  // 真黄经
  const lambda = L0 + C

  // 章动订正
  const omega = 125.04 - 1934.136 * T
  const lambdaCorr = lambda - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180)

  return ((lambdaCorr % 360) + 360) % 360
}

/**
 * 公历转儒略日
 */
function toJD(year: number, month: number, day: number, hour: number = 12, minute: number = 0): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  const J0 = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  return J0 + (hour - 12) / 24 + minute / 1440
}

/**
 * 儒略日转公历
 */
function fromJD(jd: number): { year: number; month: number; day: number; hour: number; minute: number } {
  const Z = Math.floor(jd + 0.5)
  const F = jd + 0.5 - Z

  let A = Z
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25)
    A = Z + 1 + alpha - Math.floor(alpha / 4)
  }
  const B = A + 1524
  const C = Math.floor((B - 122.1) / 365.25)
  const D = Math.floor(365.25 * C)
  const E = Math.floor((B - D) / 30.6001)

  const day = B - D - Math.floor(30.6001 * E) + F
  const month = E < 14 ? E - 1 : E - 13
  const year = month > 2 ? C - 4716 : C - 4716

  const hours = (day % 1) * 24
  const minutes = (hours % 1) * 60

  return {
    year,
    month,
    day: Math.floor(day),
    hour: Math.floor(hours),
    minute: Math.round(minutes),
  }
}

/**
 * 二分查找太阳黄经达到指定度数的日期
 */
function findSolarTermJD(targetDegree: number, startJD: number, endJD: number): number {
  let lo = startJD
  let hi = endJD

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    const lon = solarLongitude(mid)

    // 计算与目标度的差距（考虑360度环绕）
    let diff = lon - targetDegree
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    if (Math.abs(diff) < 0.002) {
      return mid
    }

    if (diff < 0) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

/**
 * 获取某年某个节气的时间
 */
export function getSolarTermDate(year: number, termName: SolarTermName): SolarTermInfo {
  const degree = SOLAR_TERM_DEGREES[termName]

  // 计算目标 JD 范围
  // 节气大约每15天一次
  // 先估算：从1月1日（或年前）开始
  let startDate: Date
  let endDate: Date

  if (degree >= 270 || degree < 30) {
    // 年前或跨年节气（小寒到春分）
    startDate = new Date(year - 1, 11, 15) // 去年12月15日
    endDate = new Date(year, 3, 15)         // 今年3月15日
  } else if (degree < 90) {
    // 春分到夏至（3-6月）
    startDate = new Date(year, 1, 15)
    endDate = new Date(year, 5, 30)
  } else if (degree < 180) {
    // 夏至到秋分（6-9月）
    startDate = new Date(year, 4, 15)
    endDate = new Date(year, 8, 15)
  } else if (degree < 270) {
    // 秋分到冬至（9-12月）
    startDate = new Date(year, 7, 15)
    endDate = new Date(year, 11, 31)
  } else {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31)
  }

  const startJD = toJD(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), 0, 0)
  const endJD = toJD(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), 23, 59)

  const termJD = findSolarTermJD(degree, startJD, endJD)
  const result = fromJD(termJD)

  return {
    name: termName,
    month: result.month,
    day: result.day,
    hour: result.hour,
    minute: result.minute,
  }
}

/**
 * 获取某年的全部二十四节气
 */
export function getYearSolarTerms(year: number): SolarTermInfo[] {
  const results: SolarTermInfo[] = []
  for (const name of SOLAR_TERM_NAMES) {
    results.push(getSolarTermDate(year, name))
  }
  return results
}

/**
 * 获取指定日期所在的月柱月支
 * 基于节气分界
 */
export function getMonthZhiIndex(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 节气顺序（从丑月开始）
  // 0小寒→丑, 1大寒→子, 2立春→寅, 3雨水→寅, 4惊蛰→卯...
  // 月支映射：丑=11, 子=10, 寅=0, 卯=1, 辰=2...
  const monthZhiOrder = [11, 10, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]

  // 找到最后一个满足条件的节气索引
  let lastIndex = -1
  for (let i = 0; i < SOLAR_TERM_NAMES.length; i++) {
    const info = getSolarTermDate(year, SOLAR_TERM_NAMES[i])
    if (month > info.month || (month === info.month && day >= info.day)) {
      lastIndex = i
    }
  }

  // 如果1月份还没到小寒，查去年的冬至
  if (month === 1 && lastIndex === -1) {
    // 1月在小寒之前，属于丑月
    return 11
  }

  if (lastIndex === -1) {
    return 11 // 默认丑月
  }

  return monthZhiOrder[lastIndex]
}
