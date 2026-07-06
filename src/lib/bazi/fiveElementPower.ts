import type { SixLines, FiveElement, HeavenlyStem, EarthlyBranch, CangGan, WuXingWangShuai } from './types'
import { getStemElement, getBranchElement, WANG_SHUAI_TABLE } from '@/lib/core'

export interface ElementPowerDetail {
  element: FiveElement
  total: number
  percentage: number
  fromStems: number
  fromMonthBen: number
  fromMonthZhong: number
  fromMonthYao: number
  fromOtherBen: number
  fromOtherZhong: number
  fromOtherYao: number
  fromTongGen: number
  wangShuai: WuXingWangShuai
}

export interface FiveElementPowerResult {
  elements: ElementPowerDetail[]
  sortedByPower: FiveElement[]
  dominant: FiveElement
  weakest: FiveElement
  totalScore: number
  mostWang: FiveElement
  mostShuai: FiveElement
}

const CANG_GAN_TABLE: Record<string, { ben: string; zhong: string | null; yao: string | null }> = {
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

export function calculateFiveElementPower(
  sixLines: SixLines,
  dayGan: HeavenlyStem,
): FiveElementPowerResult {
  const elements: FiveElement[] = ['木', '火', '土', '金', '水']
  const monthZhi = sixLines.month.zhi as EarthlyBranch
  const monthElement = getBranchElement(monthZhi)
  const dayElement = getStemElement(dayGan)

  const cangGanData: Record<string, { ben: string; zhong: string | null; yao: string | null }> = {}
  const pillars = [sixLines.year, sixLines.month, sixLines.day, sixLines.hour]
  for (const p of pillars) {
    cangGanData[p.zhi] = CANG_GAN_TABLE[p.zhi] || { ben: '', zhong: null, yao: null }
  }

  const scores: Record<FiveElement, {
    fromStems: number
    fromMonthBen: number
    fromMonthZhong: number
    fromMonthYao: number
    fromOtherBen: number
    fromOtherZhong: number
    fromOtherYao: number
    fromTongGen: number
    total: number
  }> = {} as any

  for (const el of elements) {
    scores[el] = {
      fromStems: 0,
      fromMonthBen: 0,
      fromMonthZhong: 0,
      fromMonthYao: 0,
      fromOtherBen: 0,
      fromOtherZhong: 0,
      fromOtherYao: 0,
      fromTongGen: 0,
      total: 0,
    }
  }

  for (const pillar of pillars) {
    const ganEl = getStemElement(pillar.gan as HeavenlyStem)
    scores[ganEl].fromStems += 10
  }

  const monthCangGan = cangGanData[monthZhi]
  if (monthCangGan) {
    const benEl = getStemElement(monthCangGan.ben as HeavenlyStem)
    scores[benEl].fromMonthBen += 20
    if (monthCangGan.zhong) {
      const zhongEl = getStemElement(monthCangGan.zhong as HeavenlyStem)
      scores[zhongEl].fromMonthZhong += 10
    }
    if (monthCangGan.yao) {
      const yaoEl = getStemElement(monthCangGan.yao as HeavenlyStem)
      scores[yaoEl].fromMonthYao += 5
    }
  }

  for (const pillar of pillars) {
    if (pillar.zhi === monthZhi) continue
    const cangGan = cangGanData[pillar.zhi]
    if (!cangGan) continue

    const benEl = getStemElement(cangGan.ben as HeavenlyStem)
    scores[benEl].fromOtherBen += 6
    if (cangGan.zhong) {
      const zhongEl = getStemElement(cangGan.zhong as HeavenlyStem)
      scores[zhongEl].fromOtherZhong += 3
    }
    if (cangGan.yao) {
      const yaoEl = getStemElement(cangGan.yao as HeavenlyStem)
      scores[yaoEl].fromOtherYao += 1
    }
  }

  for (const pillar of pillars) {
    const cangGan = cangGanData[pillar.zhi]
    if (!cangGan) continue

    if (getStemElement(cangGan.ben as HeavenlyStem) === dayElement) {
      scores[dayElement].fromTongGen += 10
    } else if (cangGan.zhong && getStemElement(cangGan.zhong as HeavenlyStem) === dayElement) {
      scores[dayElement].fromTongGen += 5
    } else if (cangGan.yao && getStemElement(cangGan.yao as HeavenlyStem) === dayElement) {
      scores[dayElement].fromTongGen += 2
    }
  }

  let totalScore = 0
  for (const el of elements) {
    const s = scores[el]
    s.total = s.fromStems
      + s.fromMonthBen + s.fromMonthZhong + s.fromMonthYao
      + s.fromOtherBen + s.fromOtherZhong + s.fromOtherYao
      + s.fromTongGen
    totalScore += s.total
  }

  const elementDetails: ElementPowerDetail[] = elements.map(el => {
    const s = scores[el]
    const wangShuai = WANG_SHUAI_TABLE[monthElement][el] as WuXingWangShuai
    return {
      element: el,
      total: s.total,
      percentage: totalScore > 0 ? Math.round((s.total / totalScore) * 100) : 0,
      fromStems: s.fromStems,
      fromMonthBen: s.fromMonthBen,
      fromMonthZhong: s.fromMonthZhong,
      fromMonthYao: s.fromMonthYao,
      fromOtherBen: s.fromOtherBen,
      fromOtherZhong: s.fromOtherZhong,
      fromOtherYao: s.fromOtherYao,
      fromTongGen: s.fromTongGen,
      wangShuai,
    }
  })

  const sortedByPower = [...elements].sort((a, b) => scores[b].total - scores[a].total)
  const dominant = sortedByPower[0]
  const weakest = sortedByPower[sortedByPower.length - 1]

  const wangOrder: WuXingWangShuai[] = ['旺', '相', '休', '囚', '死']
  const sortedByWangShuai = [...elements].sort((a, b) => {
    const wsA = WANG_SHUAI_TABLE[monthElement][a]
    const wsB = WANG_SHUAI_TABLE[monthElement][b]
    return wangOrder.indexOf(wsA as WuXingWangShuai) - wangOrder.indexOf(wsB as WuXingWangShuai)
  })
  const mostWang = sortedByWangShuai[0]
  const mostShuai = sortedByWangShuai[sortedByWangShuai.length - 1]

  return {
    elements: elementDetails,
    sortedByPower,
    dominant,
    weakest,
    totalScore,
    mostWang,
    mostShuai,
  }
}

export const ELEMENT_COLORS: Record<FiveElement, string> = {
  木: '#4a9c6d',
  火: '#d4573a',
  土: '#c4956a',
  金: '#d4af37',
  水: '#4a7ab8',
}

export const ELEMENT_LABELS: Record<FiveElement, string> = {
  木: '木',
  火: '火',
  土: '土',
  金: '金',
  水: '水',
}
