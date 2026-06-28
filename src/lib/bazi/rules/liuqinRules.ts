/**
 * 六亲规则
 * 根据日主五行推断六亲关系
 */

import type { FiveElement } from '../types'

// 六亲对应表
export interface LiuQinMapping {
  name: string
  gan: string           // 对应天干
  element: FiveElement // 对应五行
  relation: string     // 关系描述
}

export interface LiuQinContext {
  dayGan: string
  dayElement: FiveElement
}

// 日主六亲表
export const LIUQIN_MAPPINGS: Record<string, LiuQinMapping[]> = {
  '木': [
    { name: '父亲', gan: '壬', element: '水', relation: '水生木' },
    { name: '母亲', gan: '癸', element: '水', relation: '水生木' },
    { name: '兄弟', gan: '甲', element: '木', relation: '同类' },
    { name: '姐妹', gan: '乙', element: '木', relation: '同类' },
    { name: '丈夫', gan: '庚', element: '金', relation: '金克木' },
    { name: '妻子', gan: '己', element: '土', relation: '木克土' },
    { name: '儿子', gan: '丙', element: '火', relation: '木生火' },
    { name: '女儿', gan: '丁', element: '火', relation: '木生火' },
  ],
  '火': [
    { name: '父亲', gan: '甲', element: '木', relation: '木生火' },
    { name: '母亲', gan: '乙', element: '木', relation: '木生火' },
    { name: '兄弟', gan: '丙', element: '火', relation: '同类' },
    { name: '姐妹', gan: '丁', element: '火', relation: '同类' },
    { name: '丈夫', gan: '壬', element: '水', relation: '水克火' },
    { name: '妻子', gan: '戊', element: '土', relation: '火生土' },
    { name: '儿子', gan: '戊', element: '土', relation: '火生土' },
    { name: '女儿', gan: '己', element: '土', relation: '火生土' },
  ],
  '土': [
    { name: '父亲', gan: '丙', element: '火', relation: '火生土' },
    { name: '母亲', gan: '丁', element: '火', relation: '火生土' },
    { name: '兄弟', gan: '戊', element: '土', relation: '同类' },
    { name: '姐妹', gan: '己', element: '土', relation: '同类' },
    { name: '丈夫', gan: '甲', element: '木', relation: '木克土' },
    { name: '妻子', gan: '辛', element: '金', relation: '土生金' },
    { name: '儿子', gan: '庚', element: '金', relation: '土生金' },
    { name: '女儿', gan: '辛', element: '金', relation: '土生金' },
  ],
  '金': [
    { name: '父亲', gan: '戊', element: '土', relation: '土生金' },
    { name: '母亲', gan: '己', element: '土', relation: '土生金' },
    { name: '兄弟', gan: '庚', element: '金', relation: '同类' },
    { name: '姐妹', gan: '辛', element: '金', relation: '同类' },
    { name: '丈夫', gan: '丙', element: '火', relation: '火克金' },
    { name: '妻子', gan: '癸', element: '水', relation: '金生水' },
    { name: '儿子', gan: '壬', element: '水', relation: '金生水' },
    { name: '女儿', gan: '癸', element: '水', relation: '金生水' },
  ],
  '水': [
    { name: '父亲', gan: '庚', element: '金', relation: '金生水' },
    { name: '母亲', gan: '辛', element: '金', relation: '金生水' },
    { name: '兄弟', gan: '壬', element: '水', relation: '同类' },
    { name: '姐妹', gan: '癸', element: '水', relation: '同类' },
    { name: '丈夫', gan: '丁', element: '火', relation: '火克水' },
    { name: '妻子', gan: '甲', element: '木', relation: '水生木' },
    { name: '儿子', gan: '甲', element: '木', relation: '水生木' },
    { name: '女儿', gan: '乙', element: '木', relation: '水生木' },
  ],
}

export interface LiuQinRule {
  id: string
  priority: number
  condition: (ctx: LiuQinContext) => boolean
  result: LiuQinMapping[]
}

/**
 * 获取六亲信息
 */
export function getLiuQin(dayGan: string): LiuQinMapping[] {
  const dayElement = getElement(dayGan)
  return LIUQIN_MAPPINGS[dayElement] || []
}

function getElement(gan: string): FiveElement {
  const map: Record<string, FiveElement> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
  }
  return map[gan] || '土'
}

/**
 * 六亲规则列表
 */
export const LIUQIN_RULES: LiuQinRule[] = [
  {
    id: 'mu-liuqin',
    priority: 10,
    condition: (ctx) => ctx.dayElement === '木',
    result: LIUQIN_MAPPINGS['木'],
  },
  {
    id: 'huo-liuqin',
    priority: 10,
    condition: (ctx) => ctx.dayElement === '火',
    result: LIUQIN_MAPPINGS['火'],
  },
  {
    id: 'tu-liuqin',
    priority: 10,
    condition: (ctx) => ctx.dayElement === '土',
    result: LIUQIN_MAPPINGS['土'],
  },
  {
    id: 'jin-liuqin',
    priority: 10,
    condition: (ctx) => ctx.dayElement === '金',
    result: LIUQIN_MAPPINGS['金'],
  },
  {
    id: 'shui-liuqin',
    priority: 10,
    condition: (ctx) => ctx.dayElement === '水',
    result: LIUQIN_MAPPINGS['水'],
  },
]
