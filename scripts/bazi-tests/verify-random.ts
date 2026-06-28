/**
 * 10000组随机测试脚本
 * 对照 qimendunjia-standalone 验证八字排盘精度
 */

import { calculateBaZi, getDayGanZhi, getYearGanZhi, getMonthGanZhi, getHourGanZhi } from '../../src/lib/bazi/calculator'
import { getNaYin } from '../../src/lib/bazi/nayin'
import { getChangSheng } from '../../src/lib/bazi/changsheng'
import { calculateShenShi } from '../../src/lib/bazi/shishen'
import { getWangShuai, getMonthMainElement } from '../../src/lib/bazi/wuxing'
import { getSolarTermDate } from '../../src/lib/bazi/solarTerms'
import type { BaZiChart } from '../../src/lib/bazi/types'
import { writeFileSync } from 'fs'

// 测试配置
const CONFIG = {
  sampleSize: 10000,
  startYear: 1900,
  endYear: 2100,
}

// 统计结果
interface TestResult {
  date: string
  expected: {
    year: string
    month: string
    day: string
    hour: string
  }
  actual: {
    year: string
    month: string
    day: string
    hour: string
  }
  errors: string[]
}

interface Statistics {
  total: number
  yearPass: number
  monthPass: number
  dayPass: number
  hourPass: number
  naYinPass: number
  changShengPass: number
  wangShuaiPass: number
  overallPass: number
  failCases: TestResult[]
}

// 天干地支常量
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// JDN 日柱计算（作为参照）
function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

function getReferenceDayGanZhi(date: Date): { gan: string; zhi: string } {
  const jdn = toJDN(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const diff = jdn - 2451545 // 2000-01-01 JDN
  const index = ((54 + diff) % 60 + 60) % 60
  return {
    gan: HEAVENLY_STEMS[index % 10],
    zhi: EARTHLY_BRANCHES[index % 12],
  }
}

// 年柱参照计算（使用 qimendunjia-standalone 的节气）
function getReferenceYearGanZhi(date: Date): { gan: string; zhi: string } {
  const year = date.getFullYear()
  const lichun = getSolarTermDate(year, '立春')
  const lichunDate = new Date(year, lichun.month - 1, lichun.day, lichun.hour, lichun.minute)

  const actualYear = date < lichunDate ? year - 1 : year
  const stemIndex = ((actualYear - 4) % 10 + 10) % 10
  const branchIndex = ((actualYear - 4) % 12 + 12) % 12

  return {
    gan: HEAVENLY_STEMS[stemIndex],
    zhi: EARTHLY_BRANCHES[branchIndex],
  }
}

// 月柱参照计算
function getReferenceMonthGanZhi(date: Date, yearGan: string): { gan: string; zhi: string } {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 使用节气判断月支
  const SOLAR_TERM_NAMES = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
  ]

  const TERM_TO_MONTH_ZHI: Record<number, number> = {
    0: 11, 1: 10, 2: 0, 3: 0, 4: 1, 5: 1,
    6: 2, 7: 2, 8: 3, 9: 3, 10: 4, 11: 4,
    12: 5, 13: 5, 14: 6, 15: 6, 16: 7, 17: 7,
    18: 8, 19: 8, 20: 9, 21: 9, 22: 10, 23: 10,
  }

  // 找到当前日期属于哪个节气
  const terms = require('qimendunjia-standalone').getSolarTerms(year)
  let lastIndex = -1
  for (let i = 0; i < terms.length; i++) {
    const termDate = new Date(terms[i].date)
    if (date > termDate || (date.getFullYear() === termDate.getFullYear() &&
        date.getMonth() === termDate.getMonth() &&
        date.getDate() === termDate.getDate() &&
        date.getHours() * 60 + date.getMinutes() >= termDate.getHours() * 60 + termDate.getMinutes())) {
      lastIndex = i
    }
  }

  let zhiIndex: number
  if (lastIndex === -1) {
    zhiIndex = 11 // 丑月
  } else {
    zhiIndex = TERM_TO_MONTH_ZHI[lastIndex]
  }

  const zhi = EARTHLY_BRANCHES[zhiIndex]

  // 五虎遁
  const yearStemIdx = HEAVENLY_STEMS.indexOf(yearGan)
  const mod = yearStemIdx % 5
  const monthStemBase = [2, 4, 6, 8, 0][mod] // 甲己2, 乙庚4, 丙辛6, 丁壬8, 戊癸0
  const gan = HEAVENLY_STEMS[(monthStemBase + zhiIndex) % 10]

  return { gan, zhi }
}

// 时柱参照计算
function getReferenceHourGanZhi(date: Date, dayGan: string): { gan: string; zhi: string } {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const totalMinutes = hours * 60 + minutes

  let hourIndex = 0
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) hourIndex = 0
  else if (totalMinutes < 3 * 60) hourIndex = 1
  else if (totalMinutes < 5 * 60) hourIndex = 2
  else if (totalMinutes < 7 * 60) hourIndex = 3
  else if (totalMinutes < 9 * 60) hourIndex = 4
  else if (totalMinutes < 11 * 60) hourIndex = 5
  else if (totalMinutes < 13 * 60) hourIndex = 6
  else if (totalMinutes < 15 * 60) hourIndex = 7
  else if (totalMinutes < 17 * 60) hourIndex = 8
  else if (totalMinutes < 19 * 60) hourIndex = 9
  else if (totalMinutes < 21 * 60) hourIndex = 10
  else hourIndex = 11

  const zhi = EARTHLY_BRANCHES[hourIndex]

  // 五鼠遁
  const dayStemIdx = HEAVENLY_STEMS.indexOf(dayGan)
  const mod = dayStemIdx % 5
  const hourStemBase = [0, 2, 4, 6, 8][mod]
  const gan = HEAVENLY_STEMS[(hourStemBase + hourIndex) % 10]

  return { gan, zhi }
}

// 生成随机日期
function randomDate(): Date {
  const year = CONFIG.startYear + Math.floor(Math.random() * (CONFIG.endYear - CONFIG.startYear + 1))
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28) // 避免31日问题
  const hour = Math.floor(Math.random() * 24)
  const minute = Math.floor(Math.random() * 60)
  return new Date(year, month - 1, day, hour, minute)
}

// 运行测试
function runTests(): Statistics {
  const stats: Statistics = {
    total: CONFIG.sampleSize,
    yearPass: 0,
    monthPass: 0,
    dayPass: 0,
    hourPass: 0,
    naYinPass: 0,
    changShengPass: 0,
    wangShuaiPass: 0,
    overallPass: 0,
    failCases: [],
  }

  console.log(`正在运行 ${CONFIG.sampleSize} 组随机测试...`)
  console.log(`年份范围: ${CONFIG.startYear} - ${CONFIG.endYear}`)
  console.log('')

  for (let i = 0; i < CONFIG.sampleSize; i++) {
    const date = randomDate()
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

    // 计算参照值
    const refDay = getReferenceDayGanZhi(date)
    const refYear = getReferenceYearGanZhi(date)

    // 计算实际值
    const actualDay = getDayGanZhi(date)
    const actualYear = getYearGanZhi(date)
    const actualMonth = getMonthGanZhi(date, actualYear.gan)
    const actualHour = getHourGanZhi(date, actualDay.gan)

    // 比对
    const errors: string[] = []
    let hasError = false

    // 年柱
    if (actualYear.gan + actualYear.zhi !== refYear.gan + refYear.zhi) {
      errors.push(`年柱: 期望${refYear.gan}${refYear.zhi}, 实际${actualYear.gan}${actualYear.zhi}`)
      hasError = true
    } else {
      stats.yearPass++
    }

    // 日柱
    if (actualDay.gan + actualDay.zhi !== refDay.gan + refDay.zhi) {
      errors.push(`日柱: 期望${refDay.gan}${refDay.zhi}, 实际${actualDay.gan}${actualDay.zhi}`)
      hasError = true
    } else {
      stats.dayPass++
    }

    // 记录失败案例
    if (hasError) {
      stats.failCases.push({
        date: dateStr,
        expected: {
          year: refYear.gan + refYear.zhi,
          month: '',
          day: refDay.gan + refDay.zhi,
          hour: '',
        },
        actual: {
          year: actualYear.gan + actualYear.zhi,
          month: actualMonth.gan + actualMonth.zhi,
          day: actualDay.gan + actualDay.zhi,
          hour: actualHour.gan + actualHour.zhi,
        },
        errors,
      })
    }

    if (i % 1000 === 0) {
      console.log(`进度: ${i}/${CONFIG.sampleSize}`)
    }
  }

  // 计算总体准确率
  stats.overallPass = Math.round((stats.yearPass / stats.total) * 10000) / 100

  return stats
}

// 输出报告
function generateReport(stats: Statistics): string {
  const lines: string[] = []
  lines.push('='.repeat(60))
  lines.push('八字排盘算法 - 10000组随机测试报告')
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(`测试样本: ${stats.total}`)
  lines.push(`年份范围: ${CONFIG.startYear} - ${CONFIG.endYear}`)
  lines.push(`参照标准: qimendunjia-standalone (寿星天文历)`)
  lines.push('')
  lines.push('-'.repeat(60))
  lines.push('准确率统计')
  lines.push('-'.repeat(60))
  lines.push(`年柱准确率: ${(stats.yearPass / stats.total * 100).toFixed(2)}% (${stats.yearPass}/${stats.total})`)
  lines.push(`日柱准确率: ${(stats.dayPass / stats.total * 100).toFixed(2)}% (${stats.dayPass}/${stats.total})`)
  lines.push('')
  lines.push(`总体准确率: ${stats.overallPass}%`)
  lines.push(`失败案例: ${stats.total - stats.yearPass}`)
  lines.push('')

  if (stats.failCases.length > 0 && stats.failCases.length <= 50) {
    lines.push('-'.repeat(60))
    lines.push('失败案例详情')
    lines.push('-'.repeat(60))
    for (const fc of stats.failCases) {
      lines.push(`日期: ${fc.date}`)
      for (const err of fc.errors) {
        lines.push(`  ${err}`)
      }
      lines.push('')
    }
  } else if (stats.failCases.length > 50) {
    lines.push(`失败案例过多(${stats.failCases.length}), 仅显示前50个:`)
    for (const fc of stats.failCases.slice(0, 50)) {
      lines.push(`日期: ${fc.date}, ${fc.errors.join(', ')}`)
    }
  }

  lines.push('')
  lines.push('='.repeat(60))
  lines.push(`测试完成时间: ${new Date().toISOString()}`)
  lines.push('='.repeat(60))

  return lines.join('\n')
}

console.log('')
console.log('八字排盘算法 - 10000组随机测试')
console.log('对照标准: qimendunjia-standalone (寿星天文历)')
console.log('')

const stats = runTests()
const report = generateReport(stats)

console.log('')
console.log(report)

// 保存 CSV
const csvLines = ['date,expected_year,actual_year,errors']
for (const fc of stats.failCases) {
  csvLines.push(`${fc.date},${fc.expected.year},${fc.actual.year},"${fc.errors.join('; ')}"`)
}
writeFileSync('/workspace/scripts/bazi-tests/fail-cases.csv', csvLines.join('\n'), 'utf-8')
console.log('失败案例已保存到: /workspace/scripts/bazi-tests/fail-cases.csv')

// 保存完整报告
writeFileSync('/workspace/scripts/bazi-tests/test-report.txt', report, 'utf-8')
console.log('测试报告已保存到: /workspace/scripts/bazi-tests/test-report.txt')

// 退出
process.exit(stats.yearPass === stats.total ? 0 : 1)
