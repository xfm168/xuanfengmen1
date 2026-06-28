/**
 * 格局判断
 * 基于月柱主气（透干）判断命局格局
 */

import type { GanZhi, ShenShi } from './types'

export type GeJuName =
  | '正官格'
  | '七杀格'
  | '正印格'
  | '偏印格'
  | '食神格'
  | '伤官格'
  | '正财格'
  | '偏财格'
  | '比肩格'
  | '劫财格'
  | '从官杀格'
  | '从财格'
  | '从印格'
  | '从儿格'
  | '专旺格'
  | '化气格'
  | '普通格局'

export interface GeJuResult {
  name: GeJuName
  isSpecial: boolean
  description: string
}

/**
 * 判断命局格局
 * @param sixLines 四柱干支
 * @param relatedShens 日主对各天干的十神关系
 * @returns 格局结果
 */
export function determineGeJu(
  sixLines: { year: GanZhi; month: GanZhi; day: GanZhi; hour: GanZhi },
  relatedShens: Record<string, ShenShi>,
): GeJuResult {
  const monthGan = sixLines.month.gan
  const monthShen = relatedShens[monthGan] || '偏印'

  // 统计各十神在地支本气的数量
  // 简化版：基于月干十神判断格局
  // 真正的格局判断需要看月令、透干、通根等综合因素

  // 普通格局
  const normalJu: GeJuResult = {
    name: '普通格局',
    isSpecial: false,
    description: '命局五行较平衡，无特殊格局。',
  }

  switch (monthShen) {
    case '正官':
      return { name: '正官格', isSpecial: false, description: '月令正官，官星得用，贵气临身。' }
    case '偏官':
      return { name: '七杀格', isSpecial: false, description: '月令七杀，杀印相生，威权显赫。' }
    case '正印':
      return { name: '正印格', isSpecial: false, description: '月令正印，印星当令，文章盖世。' }
    case '偏印':
      return { name: '偏印格', isSpecial: false, description: '月令偏印，创意独特，技艺成名。' }
    case '食神':
      return { name: '食神格', isSpecial: false, description: '月令食神，泄秀生财，福禄双全。' }
    case '伤官':
      return { name: '伤官格', isSpecial: false, description: '月令伤官，伤官伤尽，聪明异常。' }
    case '正财':
      return { name: '正财格', isSpecial: false, description: '月令正财，勤劳致富，理财有方。' }
    case '偏财':
      return { name: '偏财格', isSpecial: false, description: '月令偏财，商贾之人，财运亨通。' }
    case '比肩':
      return { name: '比肩格', isSpecial: false, description: '月令比肩，自立自强，竞争得胜。' }
    case '劫财':
      return { name: '劫财格', isSpecial: false, description: '月令劫财，争夺为用，晚景可期。' }
    default:
      return normalJu
  }
}

/**
 * 获取格局名称列表
 */
export function getGeJuNames(): GeJuName[] {
  return [
    '正官格', '七杀格', '正印格', '偏印格',
    '食神格', '伤官格', '正财格', '偏财格',
    '比肩格', '劫财格', '从官杀格', '从财格',
    '从印格', '从儿格', '专旺格', '化气格', '普通格局',
  ]
}
