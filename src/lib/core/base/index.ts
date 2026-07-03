/**
 * Core 基础值对象
 * 带行为的数据结构
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  YinYang,
  NaYin,
} from '../types/base'
import type { CangGan } from '../constants/canggan'

// ─── 干支值对象 ───

export interface GanZhi {
  gan: HeavenlyStem
  zhi: EarthlyBranch
  element: FiveElement
  yinYang: YinYang
  naYin: NaYin
  shenShi?: string
  changSheng?: string
}

// ─── 四柱值对象 ───

export interface SixLines {
  year: GanZhi
  month: GanZhi
  day: GanZhi
  hour: GanZhi
}

// ─── 五行计数 ───

export interface FiveElementCount {
  木: number
  火: number
  土: number
  金: number
  水: number
}

// ─── 藏干数据 ───

export type CangGanMap = Record<EarthlyBranch, CangGan>
